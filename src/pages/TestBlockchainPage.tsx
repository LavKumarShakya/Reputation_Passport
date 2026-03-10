import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { testBlockchainConnection, testVerification, testGetUserCredentials, runIntegrationTest } from '@/utils/testBlockchain';
import { hashCredential } from '@/utils/hashCredential';

/**
 * @notice Test page for blockchain integration
 * @dev Access at /test-blockchain route
 * 
 * This page provides a UI for testing blockchain functionality:
 * - Contract connection
 * - Credential hashing
 * - Verification flow
 * - User credential retrieval
 */
export default function TestBlockchainPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const handleTestConnection = async () => {
    setLoading(true);
    clearResults();
    addResult('Starting connection test...');
    
    try {
      // Capture console.log output
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        addResult(args.join(' '));
        originalLog(...args);
      };

      await testBlockchainConnection();
      
      console.log = originalLog;
      addResult('✅ Connection test completed');
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestHashing = async () => {
    setLoading(true);
    clearResults();
    addResult('Testing credential hashing...');
    
    try {
      const testData = {
        event: "GDG Hackathon",
        position: "1st",
        date: "2025-02-10"
      };
      
      addResult(`Input data: ${JSON.stringify(testData)}`);
      const hash = await hashCredential(testData);
      addResult(`✅ Hash computed: ${hash}`);
      addResult(`Hash length: ${hash.length} characters`);
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestVerification = async () => {
    setLoading(true);
    clearResults();
    addResult('Testing credential verification...');
    
    try {
      const testUser = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const testCredential = {
        userWallet: testUser,
        issuerWallet: '0xISSUER_WALLET_1',
        category: 'Hackathon Win',
        data: {
          event: "GDG Hackathon",
          position: "1st",
          date: "2025-02-10"
        }
      };

      const originalLog = console.log;
      console.log = (...args: any[]) => {
        addResult(args.join(' '));
        originalLog(...args);
      };

      await testVerification(testUser, testCredential);
      
      console.log = originalLog;
      addResult('✅ Verification test completed');
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRunIntegrationTest = async () => {
    setLoading(true);
    clearResults();
    addResult('Running full integration test...');
    
    try {
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        addResult(args.join(' '));
        originalLog(...args);
      };

      await runIntegrationTest();
      
      console.log = originalLog;
      addResult('✅ Integration test completed');
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blockchain Integration Test</h1>
        <p className="text-muted-foreground">
          Test and verify blockchain functionality
        </p>
      </div>

      <div className="grid gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Test</CardTitle>
            <CardDescription>Test contract initialization and network connection</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleTestConnection} 
              disabled={loading}
              className="w-full"
            >
              Test Connection
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hashing Test</CardTitle>
            <CardDescription>Test credential data hashing</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleTestHashing} 
              disabled={loading}
              className="w-full"
            >
              Test Hashing
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Test</CardTitle>
            <CardDescription>Test credential verification flow</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleTestVerification} 
              disabled={loading}
              className="w-full"
            >
              Test Verification
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Full Integration Test</CardTitle>
            <CardDescription>Run complete integration test suite</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleRunIntegrationTest} 
              disabled={loading}
              className="w-full"
            >
              Run Integration Test
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Test Results</CardTitle>
            <Button variant="outline" size="sm" onClick={clearResults}>
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-muted-foreground text-sm">No test results yet. Run a test to see output.</p>
            ) : (
              <div className="space-y-1 font-mono text-xs">
                {results.map((result, index) => (
                  <div key={index} className="text-foreground">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <strong>Contract Address:</strong> Update in <code className="text-xs bg-muted px-1 rounded">src/lib/contract.ts</code>
          </div>
          <div>
            <strong>Test Script:</strong> <code className="text-xs bg-muted px-1 rounded">cd blockchain && npx hardhat run test.js --network hardhat</code>
          </div>
          <div>
            <strong>Deploy:</strong> <code className="text-xs bg-muted px-1 rounded">cd blockchain && npx hardhat run deploy.js --network amoy</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

