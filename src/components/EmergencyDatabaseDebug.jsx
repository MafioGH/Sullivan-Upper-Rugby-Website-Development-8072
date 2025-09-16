import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import supabase from '../lib/supabase';

const { FiAlertTriangle, FiDatabase, FiCheck, FiX, FiRefreshCw, FiInfo, FiCode } = FiIcons;

const EmergencyDatabaseDebug = () => {
  const [debugResults, setDebugResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [consoleErrors, setConsoleErrors] = useState([]);

  // Capture console errors
  useEffect(() => {
    const originalError = console.error;
    const originalLog = console.log;
    const errors = [];

    console.error = (...args) => {
      errors.push({ type: 'error', message: args.join(' '), timestamp: new Date() });
      setConsoleErrors([...errors]);
      originalError.apply(console, args);
    };

    console.log = (...args) => {
      if (args.some(arg => typeof arg === 'string' && arg.includes('Supabase'))) {
        errors.push({ type: 'log', message: args.join(' '), timestamp: new Date() });
        setConsoleErrors([...errors]);
      }
      originalLog.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.log = originalLog;
    };
  }, []);

  const runEmergencyDiagnostic = async () => {
    setIsRunning(true);
    const results = {};
    
    console.log('🚨 EMERGENCY DATABASE DIAGNOSTIC STARTING...');
    
    try {
      // TEST 1: Check Supabase client configuration
      console.log('📋 TEST 1: Checking Supabase configuration...');
      results.config = {
        url: supabase.supabaseUrl,
        hasAnonKey: !!supabase.supabaseKey,
        clientCreated: !!supabase,
        success: true
      };
      console.log('✅ Supabase client configuration OK');

      // TEST 2: Basic connection test
      console.log('📋 TEST 2: Testing basic connection...');
      try {
        const { data: connectionTest, error: connectionError } = await supabase
          .from('media_rugby12345')
          .select('count')
          .limit(1);
        
        if (connectionError) {
          throw connectionError;
        }
        
        results.connection = {
          success: true,
          message: 'Connection successful'
        };
        console.log('✅ Basic connection test PASSED');
      } catch (error) {
        results.connection = {
          success: false,
          error: error.message,
          details: error
        };
        console.error('❌ Basic connection test FAILED:', error);
      }

      // TEST 3: Check if table exists
      console.log('📋 TEST 3: Checking if media table exists...');
      try {
        const { data: tableCheck, error: tableError } = await supabase
          .from('media_rugby12345')
          .select('*')
          .limit(1);
        
        if (tableError && tableError.code === '42P01') {
          // Table doesn't exist
          results.tableExists = {
            success: false,
            error: 'Table does not exist',
            code: tableError.code
          };
          console.error('❌ Table media_rugby12345 does NOT exist');
        } else if (tableError) {
          throw tableError;
        } else {
          results.tableExists = {
            success: true,
            message: 'Table exists and is accessible',
            recordCount: tableCheck?.length || 0
          };
          console.log('✅ Table exists and is accessible');
        }
      } catch (error) {
        results.tableExists = {
          success: false,
          error: error.message,
          code: error.code
        };
        console.error('❌ Table check failed:', error);
      }

      // TEST 4: Test insert permissions
      console.log('📋 TEST 4: Testing insert permissions...');
      try {
        const testData = {
          type: 'video',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          title: 'EMERGENCY TEST - DELETE ME',
          description: 'Testing database insert functionality',
          date: new Date().toISOString().split('T')[0],
          tags: ['debug', 'test'],
          videoType: 'youtube'
        };

        console.log('🔄 Attempting to insert test data:', testData);

        const { data: insertResult, error: insertError } = await supabase
          .from('media_rugby12345')
          .insert([testData])
          .select();

        if (insertError) {
          throw insertError;
        }

        results.insertTest = {
          success: true,
          message: 'Insert successful',
          insertedId: insertResult[0]?.id,
          data: insertResult[0]
        };
        console.log('✅ Insert test PASSED:', insertResult);

        // Clean up test data
        if (insertResult[0]?.id) {
          await supabase
            .from('media_rugby12345')
            .delete()
            .eq('id', insertResult[0].id);
          console.log('🧹 Test data cleaned up');
        }

      } catch (error) {
        results.insertTest = {
          success: false,
          error: error.message,
          code: error.code,
          details: error
        };
        console.error('❌ Insert test FAILED:', error);
      }

      // TEST 5: Check current data count
      console.log('📋 TEST 5: Checking current data...');
      try {
        const { data: countData, error: countError } = await supabase
          .from('media_rugby12345')
          .select('*');

        if (countError) {
          throw countError;
        }

        results.dataCheck = {
          success: true,
          totalItems: countData?.length || 0,
          videos: countData?.filter(item => item.type === 'video').length || 0,
          images: countData?.filter(item => item.type === 'image').length || 0,
          recentItems: countData?.slice(0, 3) || []
        };
        console.log('✅ Data check complete:', results.dataCheck);
      } catch (error) {
        results.dataCheck = {
          success: false,
          error: error.message
        };
        console.error('❌ Data check failed:', error);
      }

    } catch (globalError) {
      results.globalError = {
        success: false,
        error: globalError.message,
        details: globalError
      };
      console.error('💥 Global diagnostic error:', globalError);
    }

    setDebugResults(results);
    setIsRunning(false);
    console.log('🚨 EMERGENCY DIAGNOSTIC COMPLETE');
  };

  const createTable = async () => {
    try {
      console.log('🛠️ Creating media table...');
      
      // Note: This would need to be done via SQL in Supabase dashboard
      // We can't create tables via the client
      alert('TABLE CREATION REQUIRED:\n\nPlease go to your Supabase SQL Editor and run:\n\nCREATE TABLE media_rugby12345 (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  type TEXT NOT NULL,\n  url TEXT NOT NULL,\n  title TEXT NOT NULL,\n  description TEXT,\n  date DATE NOT NULL,\n  tags TEXT[],\n  videoType TEXT DEFAULT \'youtube\',\n  created_at TIMESTAMP DEFAULT NOW()\n);\n\nALTER TABLE media_rugby12345 ENABLE ROW LEVEL SECURITY;\n\nCREATE POLICY "Enable all access" ON media_rugby12345 FOR ALL USING (true);');
      
    } catch (error) {
      console.error('Table creation error:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg border-2 border-red-500">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-red-600 flex items-center gap-3">
          <SafeIcon icon={FiAlertTriangle} className="animate-pulse" />
          EMERGENCY DATABASE DIAGNOSTIC
        </h1>
        <button
          onClick={runEmergencyDiagnostic}
          disabled={isRunning}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <SafeIcon icon={isRunning ? FiRefreshCw : FiDatabase} className={isRunning ? 'animate-spin' : ''} />
          <span>{isRunning ? 'Running Diagnostic...' : 'Run Emergency Diagnostic'}</span>
        </button>
      </div>

      {/* Console Errors */}
      {consoleErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
            <SafeIcon icon={FiCode} className="mr-2" />
            Console Errors ({consoleErrors.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {consoleErrors.slice(-10).map((error, index) => (
              <div key={index} className={`text-sm p-2 rounded ${error.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                <div className="font-mono text-xs text-gray-500">
                  {error.timestamp.toLocaleTimeString()}
                </div>
                <div className="font-mono">{error.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagnostic Results */}
      {Object.keys(debugResults).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Diagnostic Results:</h2>

          {/* Configuration Check */}
          {debugResults.config && (
            <div className={`p-4 rounded-lg border-2 ${debugResults.config.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className="font-semibold flex items-center mb-2">
                <SafeIcon icon={debugResults.config.success ? FiCheck : FiX} className="mr-2" />
                Supabase Configuration
              </h3>
              <div className="text-sm space-y-1">
                <div>URL: {debugResults.config.url}</div>
                <div>Anonymous Key: {debugResults.config.hasAnonKey ? '✅ Present' : '❌ Missing'}</div>
                <div>Client Created: {debugResults.config.clientCreated ? '✅ Yes' : '❌ No'}</div>
              </div>
            </div>
          )}

          {/* Connection Check */}
          {debugResults.connection && (
            <div className={`p-4 rounded-lg border-2 ${debugResults.connection.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className="font-semibold flex items-center mb-2">
                <SafeIcon icon={debugResults.connection.success ? FiCheck : FiX} className="mr-2" />
                Database Connection
              </h3>
              <div className="text-sm">
                {debugResults.connection.success ? (
                  <div className="text-green-700">{debugResults.connection.message}</div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-red-700">❌ {debugResults.connection.error}</div>
                    {debugResults.connection.details && (
                      <pre className="bg-red-100 p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(debugResults.connection.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Table Existence Check */}
          {debugResults.tableExists && (
            <div className={`p-4 rounded-lg border-2 ${debugResults.tableExists.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className="font-semibold flex items-center mb-2">
                <SafeIcon icon={debugResults.tableExists.success ? FiCheck : FiX} className="mr-2" />
                Table Existence (media_rugby12345)
              </h3>
              <div className="text-sm">
                {debugResults.tableExists.success ? (
                  <div className="text-green-700">
                    ✅ Table exists and accessible
                    {debugResults.tableExists.recordCount !== undefined && (
                      <div>Records found: {debugResults.tableExists.recordCount}</div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-red-700">❌ {debugResults.tableExists.error}</div>
                    {debugResults.tableExists.code === '42P01' && (
                      <div className="bg-yellow-100 p-3 rounded">
                        <div className="font-semibold text-yellow-800">TABLE DOES NOT EXIST!</div>
                        <div className="text-yellow-700 text-sm mt-1">
                          The media_rugby12345 table needs to be created in your Supabase database.
                        </div>
                        <button
                          onClick={createTable}
                          className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                        >
                          Get Table Creation SQL
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Insert Test */}
          {debugResults.insertTest && (
            <div className={`p-4 rounded-lg border-2 ${debugResults.insertTest.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className="font-semibold flex items-center mb-2">
                <SafeIcon icon={debugResults.insertTest.success ? FiCheck : FiX} className="mr-2" />
                Insert Permission Test
              </h3>
              <div className="text-sm">
                {debugResults.insertTest.success ? (
                  <div className="text-green-700">
                    ✅ Insert successful! ID: {debugResults.insertTest.insertedId}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-red-700">❌ {debugResults.insertTest.error}</div>
                    <div className="text-red-600">Code: {debugResults.insertTest.code}</div>
                    {debugResults.insertTest.details && (
                      <pre className="bg-red-100 p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(debugResults.insertTest.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Data Check */}
          {debugResults.dataCheck && (
            <div className={`p-4 rounded-lg border-2 ${debugResults.dataCheck.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className="font-semibold flex items-center mb-2">
                <SafeIcon icon={debugResults.dataCheck.success ? FiCheck : FiX} className="mr-2" />
                Current Data
              </h3>
              <div className="text-sm">
                {debugResults.dataCheck.success ? (
                  <div className="text-green-700 space-y-1">
                    <div>Total Items: {debugResults.dataCheck.totalItems}</div>
                    <div>Videos: {debugResults.dataCheck.videos}</div>
                    <div>Images: {debugResults.dataCheck.images}</div>
                    {debugResults.dataCheck.recentItems.length > 0 && (
                      <div className="mt-2">
                        <div className="font-semibold">Recent Items:</div>
                        {debugResults.dataCheck.recentItems.map((item, index) => (
                          <div key={index} className="text-xs bg-white p-2 rounded mt-1">
                            {item.type}: {item.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-700">❌ {debugResults.dataCheck.error}</div>
                )}
              </div>
            </div>
          )}

          {/* Global Error */}
          {debugResults.globalError && (
            <div className="p-4 rounded-lg border-2 bg-red-50 border-red-200">
              <h3 className="font-semibold flex items-center mb-2 text-red-800">
                <SafeIcon icon={FiX} className="mr-2" />
                Global Error
              </h3>
              <div className="text-sm text-red-700">
                {debugResults.globalError.error}
                {debugResults.globalError.details && (
                  <pre className="bg-red-100 p-2 rounded text-xs overflow-x-auto mt-2">
                    {JSON.stringify(debugResults.globalError.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
          <SafeIcon icon={FiInfo} className="mr-2" />
          Emergency Instructions
        </h3>
        <div className="text-blue-700 text-sm space-y-2">
          <div>1. Click "Run Emergency Diagnostic" to identify the exact problem</div>
          <div>2. Check console errors in your browser DevTools (F12 → Console)</div>
          <div>3. If table doesn't exist, use the SQL provided to create it</div>
          <div>4. Verify your Supabase project URL and API key are correct</div>
          <div>5. Check Row Level Security policies allow inserts</div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyDatabaseDebug;