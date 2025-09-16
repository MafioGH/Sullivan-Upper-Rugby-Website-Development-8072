import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useSupabaseData } from '../hooks/useSupabaseData';
import supabase from '../lib/supabase';

const { FiDatabase, FiCheck, FiX, FiRefreshCw, FiInfo, FiAlertTriangle } = FiIcons;

const DatabaseDebugger = () => {
  const { data: media, loading, error, addItem } = useSupabaseData('media');
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Test database connection and operations
  const runDatabaseTests = async () => {
    setIsRunningTests(true);
    const results = {};

    try {
      // Test 1: Basic connection
      console.log('🔍 Testing database connection...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('media_rugby12345')
        .select('count')
        .limit(1);

      results.connection = {
        success: !connectionError,
        error: connectionError?.message,
        message: connectionError ? 'Database connection failed' : 'Database connection successful'
      };

      // Test 2: Read permissions
      console.log('🔍 Testing read permissions...');
      const { data: readTest, error: readError } = await supabase
        .from('media_rugby12345')
        .select('*')
        .limit(5);

      results.readPermissions = {
        success: !readError,
        error: readError?.message,
        message: readError ? 'Cannot read from database' : `Read successful (${readTest?.length || 0} items found)`,
        data: readTest
      };

      // Test 3: Insert permissions
      console.log('🔍 Testing insert permissions...');
      const testVideo = {
        type: 'video',
        url: 'https://drive.google.com/file/d/TEST123/preview',
        title: 'Database Test Video - DELETE ME',
        description: 'This is a test video to verify database insert functionality',
        date: new Date().toISOString().split('T')[0],
        tags: ['test', 'database', 'debug'],
        videoType: 'googledrive'
      };

      try {
        const insertedItem = await addItem(testVideo);
        results.insertPermissions = {
          success: true,
          message: 'Insert successful',
          insertedId: insertedItem?.id
        };

        // Test 4: Delete the test item
        if (insertedItem?.id) {
          const { error: deleteError } = await supabase
            .from('media_rugby12345')
            .delete()
            .eq('id', insertedItem.id);

          results.deletePermissions = {
            success: !deleteError,
            error: deleteError?.message,
            message: deleteError ? 'Delete failed' : 'Delete successful (test cleanup complete)'
          };
        }
      } catch (insertError) {
        results.insertPermissions = {
          success: false,
          error: insertError.message,
          message: 'Insert failed'
        };
      }

      // Test 5: Check table structure
      console.log('🔍 Checking table structure...');
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_info', { table_name: 'media_rugby12345' })
        .catch(() => ({ data: null, error: { message: 'RPC function not available' } }));

      results.tableStructure = {
        success: !tableError,
        error: tableError?.message,
        message: tableError ? 'Could not verify table structure' : 'Table structure verified',
        info: tableInfo
      };

    } catch (globalError) {
      results.globalError = {
        success: false,
        error: globalError.message,
        message: 'Global test failure'
      };
    }

    setTestResults(results);
    setIsRunningTests(false);
  };

  // Get debug information
  useEffect(() => {
    const info = {
      mediaCount: media?.length || 0,
      videoCount: media?.filter(item => item.type === 'video')?.length || 0,
      imageCount: media?.filter(item => item.type === 'image')?.length || 0,
      googleDriveVideos: media?.filter(item => 
        item.type === 'video' && 
        (item.url?.includes('drive.google.com') || item.videoType === 'googledrive')
      )?.length || 0,
      hasError: !!error,
      errorMessage: error,
      isLoading: loading,
      supabaseUrl: supabase.supabaseUrl,
      lastUpdate: new Date().toLocaleTimeString()
    };

    setDebugInfo(info);
  }, [media, loading, error]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <SafeIcon icon={FiDatabase} className="text-blue-600" />
          Database Debugger
        </h2>
        <button
          onClick={runDatabaseTests}
          disabled={isRunningTests}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <SafeIcon icon={isRunningTests ? FiRefreshCw : FiDatabase} className={isRunningTests ? 'animate-spin' : ''} />
          <span>{isRunningTests ? 'Running Tests...' : 'Run Database Tests'}</span>
        </button>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{debugInfo.mediaCount}</div>
          <div className="text-sm text-blue-800">Total Media Items</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{debugInfo.videoCount}</div>
          <div className="text-sm text-purple-800">Videos</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">{debugInfo.imageCount}</div>
          <div className="text-sm text-green-800">Images</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{debugInfo.googleDriveVideos}</div>
          <div className="text-sm text-orange-800">Google Drive Videos</div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Connection Status</h3>
        <div className={`p-4 rounded-lg ${debugInfo.hasError ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={debugInfo.hasError ? FiX : FiCheck} className={debugInfo.hasError ? 'text-red-600' : 'text-green-600'} />
            <span className={debugInfo.hasError ? 'text-red-800' : 'text-green-800'}>
              {debugInfo.hasError ? `Error: ${debugInfo.errorMessage}` : 'Connected to Supabase'}
            </span>
          </div>
          <div className="text-xs text-gray-600 mt-2">
            URL: {debugInfo.supabaseUrl} | Last Update: {debugInfo.lastUpdate}
          </div>
        </div>
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Test Results</h3>
          <div className="space-y-3">
            {Object.entries(testResults).map(([testName, result]) => (
              <div key={testName} className={`p-3 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={result.success ? FiCheck : FiX} className={result.success ? 'text-green-600' : 'text-red-600'} />
                    <span className="font-medium">{testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                  </div>
                  <span className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.success ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                <div className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {result.message}
                </div>
                {result.error && (
                  <div className="text-xs text-red-600 mt-1 font-mono bg-red-100 p-2 rounded">
                    {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Media Items */}
      {media && media.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Recent Media Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Title</th>
                  <th className="text-left p-2">URL Preview</th>
                  <th className="text-left p-2">Video Type</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {media.slice(0, 10).map((item) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${item.type === 'video' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-2 font-medium">{item.title}</td>
                    <td className="p-2 font-mono text-xs text-gray-600">
                      {item.url?.substring(0, 40)}...
                    </td>
                    <td className="p-2">
                      {item.videoType && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          {item.videoType}
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-gray-600">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <SafeIcon icon={FiInfo} className="text-blue-600 mt-0.5" />
          <div className="text-blue-800">
            <div className="font-semibold mb-1">How to Use This Debugger:</div>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Run Database Tests" to check all database operations</li>
              <li>Check the "Recent Media Items" table to see what's actually stored</li>
              <li>If tests fail, run the SQL commands provided in the console</li>
              <li>If Google Drive videos aren't showing, check the URL format and videoType</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseDebugger;