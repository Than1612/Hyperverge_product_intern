import React, { createContext, useContext, useReducer, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SQLite from 'react-native-sqlite-storage';

// Enable promise-based API for react-native-sqlite-storage
SQLite.enablePromise(true);

interface OfflineState {
  isOnline: boolean;
  isConnected: boolean;
  connectionType: string | null;
  pendingActions: PendingAction[];
  lastSyncTime: Date | null;
  syncInProgress: boolean;
}

interface PendingAction {
  id: string;
  type: string;
  payload: any;
  timestamp: Date;
  retryCount: number;
}

type OfflineAction =
  | { type: 'SET_CONNECTION_STATUS'; payload: { isOnline: boolean; connectionType: string | null } }
  | { type: 'ADD_PENDING_ACTION'; payload: PendingAction }
  | { type: 'REMOVE_PENDING_ACTION'; payload: string }
  | { type: 'SET_SYNC_STATUS'; payload: { inProgress: boolean; lastSync?: Date } }
  | { type: 'UPDATE_PENDING_ACTION'; payload: { id: string; retryCount: number } };

const initialState: OfflineState = {
  isOnline: true,
  isConnected: true,
  connectionType: null,
  pendingActions: [],
  lastSyncTime: null,
  syncInProgress: false,
};

const offlineReducer = (state: OfflineState, action: OfflineAction): OfflineState => {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        isOnline: action.payload.isOnline,
        isConnected: action.payload.isOnline,
        connectionType: action.payload.connectionType,
      };
    case 'ADD_PENDING_ACTION':
      return {
        ...state,
        pendingActions: [...state.pendingActions, action.payload],
      };
    case 'REMOVE_PENDING_ACTION':
      return {
        ...state,
        pendingActions: state.pendingActions.filter(action => action.id !== action.payload),
      };
    case 'SET_SYNC_STATUS':
      return {
        ...state,
        syncInProgress: action.payload.inProgress,
        lastSyncTime: action.payload.lastSync || state.lastSyncTime,
      };
    case 'UPDATE_PENDING_ACTION':
      return {
        ...state,
        pendingActions: state.pendingActions.map(action =>
          action.id === action.payload.id
            ? { ...action, retryCount: action.payload.retryCount }
            : action
        ),
      };
    default:
      return state;
  }
};

interface OfflineContextType extends OfflineState {
  addPendingAction: (type: string, payload: any) => string;
  removePendingAction: (id: string) => void;
  syncPendingActions: () => Promise<void>;
  getOfflineData: (key: string) => Promise<any>;
  setOfflineData: (key: string, data: any) => Promise<void>;
  clearOfflineData: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(offlineReducer, initialState);
  const [db, setDb] = React.useState<any>(null);

  useEffect(() => {
    initializeDatabase();
    setupNetworkListener();
    loadPendingActions();
  }, []);

  useEffect(() => {
    if (state.isOnline && state.pendingActions.length > 0) {
      syncPendingActions();
    }
  }, [state.isOnline]);

  const initializeDatabase = async () => {
    try {
      const database = await SQLite.openDatabase({
        name: 'RuralLoanOffline.db',
        location: 'default',
      });

      // Create tables for offline storage
      await database.transaction(tx => {
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS pending_actions (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            payload TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            retry_count INTEGER DEFAULT 0
          )
        `);

        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS offline_data (
            key TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            timestamp TEXT NOT NULL
          )
        `);
      });

      setDb(database);
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  };

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch({
        type: 'SET_CONNECTION_STATUS',
        payload: {
          isOnline: state.isConnected ?? false,
          connectionType: state.type,
        },
      });
    });

    return unsubscribe;
  };

  const loadPendingActions = async () => {
    if (!db) return;

    try {
      await db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM pending_actions ORDER BY timestamp',
          [],
          (_, results) => {
            const actions: PendingAction[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              const row = results.rows.item(i);
              actions.push({
                id: row.id,
                type: row.type,
                payload: JSON.parse(row.payload),
                timestamp: new Date(row.timestamp),
                retryCount: row.retry_count,
              });
            }
            actions.forEach(action => {
              dispatch({ type: 'ADD_PENDING_ACTION', payload: action });
            });
          }
        );
      });
    } catch (error) {
      console.error('Failed to load pending actions:', error);
    }
  };

  const addPendingAction = (type: string, payload: any): string => {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const action: PendingAction = {
      id,
      type,
      payload,
      timestamp: new Date(),
      retryCount: 0,
    };

    dispatch({ type: 'ADD_PENDING_ACTION', payload: action });

    // Store in database
    if (db) {
      db.transaction((tx: any) => {
        tx.executeSql(
          'INSERT INTO pending_actions (id, type, payload, timestamp, retry_count) VALUES (?, ?, ?, ?, ?)',
          [id, type, JSON.stringify(payload), action.timestamp.toISOString(), 0]
        );
      });
    }

    return id;
  };

  const removePendingAction = (id: string) => {
    dispatch({ type: 'REMOVE_PENDING_ACTION', payload: id });

    if (db) {
      db.transaction((tx: any) => {
        tx.executeSql('DELETE FROM pending_actions WHERE id = ?', [id]);
      });
    }
  };

  const syncPendingActions = async () => {
    if (state.syncInProgress || !state.isOnline) return;

    dispatch({ type: 'SET_SYNC_STATUS', payload: { inProgress: true } });

    try {
      const actionsToSync = [...state.pendingActions];
      
      for (const action of actionsToSync) {
        try {
          // Execute the pending action
          await executePendingAction(action);
          removePendingAction(action.id);
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);
          
          // Increment retry count
          const newRetryCount = action.retryCount + 1;
          dispatch({
            type: 'UPDATE_PENDING_ACTION',
            payload: { id: action.id, retryCount: newRetryCount },
          });

          // Remove if max retries reached
          if (newRetryCount >= 3) {
            removePendingAction(action.id);
          }
        }
      }

      dispatch({
        type: 'SET_SYNC_STATUS',
        payload: { inProgress: false, lastSync: new Date() },
      });
    } catch (error) {
      console.error('Sync failed:', error);
      dispatch({ type: 'SET_SYNC_STATUS', payload: { inProgress: false } });
    }
  };

  const executePendingAction = async (action: PendingAction) => {
    // This would integrate with your API service
    // For now, we'll just simulate the action
    switch (action.type) {
      case 'SUBMIT_LOAN_APPLICATION':
        // Call loan API
        break;
      case 'UPLOAD_DOCUMENT':
        // Call document API
        break;
      case 'UPDATE_PROFILE':
        // Call profile API
        break;
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  };

  const getOfflineData = async (key: string): Promise<any> => {
    if (!db) return null;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT data FROM offline_data WHERE key = ?',
          [key],
          (_: any, results: any) => {
            if (results.rows.length > 0) {
              try {
                const data = JSON.parse(results.rows.item(0).data);
                resolve(data);
              } catch (error) {
                reject(error);
              }
            } else {
              resolve(null);
            }
          },
          (_: any, error: any) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const setOfflineData = async (key: string, data: any): Promise<void> => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'INSERT OR REPLACE INTO offline_data (key, data, timestamp) VALUES (?, ?, ?)',
          [key, JSON.stringify(data), new Date().toISOString()],
          () => resolve(),
          (_: any, error: any) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const clearOfflineData = async (): Promise<void> => {
    if (!db) return;

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'DELETE FROM offline_data',
          [],
          () => resolve(),
          (_: any, error: any) => {
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const value: OfflineContextType = {
    ...state,
    addPendingAction,
    removePendingAction,
    syncPendingActions,
    getOfflineData,
    setOfflineData,
    clearOfflineData,
  };

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
