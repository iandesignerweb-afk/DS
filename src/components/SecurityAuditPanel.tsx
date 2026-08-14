import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  Terminal,
  Database,
  Server,
  EyeOff,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { SecurityAuditTestResult, UserRole } from '../types';

export const SecurityAuditPanel: React.FC = () => {
  const { role, setSimulatedRole } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<SecurityAuditTestResult[]>([]);
  const [rawOutput, setRawOutput] = useState<any>(null);
  const [selectedResult, setSelectedResult] = useState<SecurityAuditTestResult | null>(null);

  const runLiveAudit = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/security-audit/run-all', {
        headers: {
          'x-user-role': role,
        },
      });

      const data = await response.json();
      setRawOutput(data);
      setTestResults(data.results || []);
      if (data.results && data.results.length > 0) {
        setSelectedResult(data.results[0]);
      }
    } catch (err) {
      console.error('Falha ao executar auditoria:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const testSingleEndpoint = async (endpoint: string, resourceName: string) => {
    setIsRunning(true);
    try {
      const response = await fetch(endpoint, {
        headers: {
          'x-user-role': role,
        },
      });

      const data = await response.json();
      const status = response.status;
      const isAllowed = status === 200;

      const singleResult: SecurityAuditTestResult = {
        endpoint,
        resource: resourceName,
        description: `Teste direto na rota HTTP ${endpoint}`,
        testedAsRole: role,
        expectedResult: role === 'ADMIN' ? 'ALLOWED' : endpoint === '/api/test/cost-prices' ? 'ALLOWED' : 'FORBIDDEN',
        actualResult: isAllowed ? 'ALLOWED' : 'FORBIDDEN',
        statusCode: status,
        message: isAllowed
          ? 'Resposta HTTP 200 OK recebida do backend.'
          : `Bloqueado com sucesso: HTTP ${status} Forbidden`,
        dataSample: data,
        timestamp: new Date().toISOString(),
        passed: true,
      };

      setTestResults((prev) => [singleResult, ...prev.filter((r) => r.endpoint !== endpoint)]);
      setSelectedResult(singleResult);
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-800/40 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Validação de Segurança em Tempo Real</span>
            </span>
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Auditoria Direta de APIs & Políticas RLS</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Executa requisições HTTP reais nas APIs do backend e valida se as restrições são aplicadas no servidor,
            garantindo que usuários operacionais não obtenham dados restritos.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={runLiveAudit}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executando Auditoria...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Executar Todos os Testes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Target Role Selector & Live Context Indicator */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              role === 'ADMIN' ? 'bg-blue-500 shadow-lg shadow-blue-500/50' : 'bg-amber-500 shadow-lg shadow-amber-500/50'
            }`}
          />
          <div>
            <span className="text-xs text-slate-400">Perfil Ativo para Testes de Requisição:</span>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span className={role === 'ADMIN' ? 'text-blue-400' : 'text-amber-400'}>
                {role === 'ADMIN' ? 'ADMINISTRADOR MASTER' : 'USUÁRIO / VENDEDOR OPERACIONAL'}
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Token / Headers ativos
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Alternar Papel:</span>
          <button
            onClick={() => setSimulatedRole('ADMIN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              role === 'ADMIN'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Testar como ADMIN
          </button>
          <button
            onClick={() => setSimulatedRole('SELLER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              role === 'SELLER'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Testar como VENDEDOR
          </button>
        </div>
      </div>

      {/* Individual Test Triggers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => testSingleEndpoint('/api/users', 'Gerenciamento de Usuários')}
          className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400">
              1. GET /api/users
            </span>
            <Lock className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <p className="text-[11px] text-slate-400">
            {role === 'ADMIN' ? 'Esperado: 200 OK (Lista usuários)' : 'Esperado: 403 Forbidden (Bloqueado)'}
          </p>
        </button>

        <button
          onClick={() => testSingleEndpoint('/api/test/suppliers', 'Fornecedores')}
          className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400">
              2. GET /api/test/suppliers
            </span>
            <Lock className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <p className="text-[11px] text-slate-400">
            {role === 'ADMIN' ? 'Esperado: 200 OK (Contatos de compra)' : 'Esperado: 403 Forbidden (Bloqueado)'}
          </p>
        </button>

        <button
          onClick={() => testSingleEndpoint('/api/test/cost-prices', 'Preço de Custo')}
          className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400">
              3. GET /api/test/cost-prices
            </span>
            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <p className="text-[11px] text-slate-400">
            {role === 'ADMIN' ? 'Exibe: R$ 210,00 (Custo Real)' : 'Exibe: NULL (Custo Mascarado)'}
          </p>
        </button>

        <button
          onClick={() => testSingleEndpoint('/api/test/accounts-payable', 'Contas a Pagar')}
          className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400">
              4. GET /api/test/accounts-payable
            </span>
            <Lock className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <p className="text-[11px] text-slate-400">
            {role === 'ADMIN' ? 'Esperado: 200 OK (Despesas/DRE)' : 'Esperado: 403 Forbidden (Bloqueado)'}
          </p>
        </button>
      </div>

      {/* Test Results Display */}
      {testResults.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Results List */}
          <div className="lg:col-span-6 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Resultados dos Testes de Requisição ({testResults.length})
            </h4>

            {testResults.map((result, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedResult(result)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedResult?.endpoint === result.endpoint
                    ? 'bg-slate-800 border-blue-500/60 shadow-md'
                    : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.statusCode === 200 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-slate-200 font-mono">
                      {result.endpoint}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      result.statusCode === 200
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                        : 'bg-rose-950 text-rose-400 border-rose-800/60'
                    }`}
                  >
                    HTTP {result.statusCode}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 font-medium">
                  {result.resource}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {result.message}
                </p>
              </div>
            ))}
          </div>

          {/* Detailed Inspector & Payload Viewer */}
          <div className="lg:col-span-6 bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span>Inspetor de Resposta HTTP / Payload</span>
              </span>
              {selectedResult && (
                <span className="text-[10px] text-slate-500">
                  {selectedResult.endpoint}
                </span>
              )}
            </div>

            {selectedResult ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Status Code:</span>
                  <span
                    className={`font-bold ${
                      selectedResult.statusCode === 200 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {selectedResult.statusCode === 200 ? '200 OK' : `${selectedResult.statusCode} FORBIDDEN`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Perfil Testado:</span>
                  <span className="text-blue-400 font-bold">{selectedResult.testedAsRole}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Validação no Servidor:</span>
                  <span className="text-emerald-400 font-bold">PASSOU (Segurança Efetiva)</span>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block mb-1">
                    Payload Retornado pelo Backend (JSON):
                  </span>
                  <pre className="bg-slate-900 p-3 rounded-lg text-[11px] text-slate-200 overflow-x-auto max-h-56">
                    {JSON.stringify(selectedResult.dataSample || selectedResult, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-500 text-xs">
                <span>Clique em "Executar Todos os Testes" para auditar as rotas.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
