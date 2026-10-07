'use client';

import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { MOCK_TABLES } from '../../lib/mockData';
import { Database, Key, GitFork, Table, Plus, RefreshCw, Layers } from 'lucide-react';

export default function SchemaPage() {
  const [selectedTable, setSelectedTable] = useState(MOCK_TABLES[0]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Database className="w-6 h-6 text-purple-400" /> Database Schema Studio
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Visual relational database modeller, Alembic migration tracker, and entity ERD map
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />}>
              Run Alembic Check
            </Button>
            <Button variant="glow" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
              Add Table Entity
            </Button>
          </div>
        </div>

        {/* Master Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Table List */}
          <div className="lg:col-span-5 space-y-3">
            <Card variant="default">
              <CardHeader className="py-3">
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Database Tables ({MOCK_TABLES.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-1">
                {MOCK_TABLES.map((t) => {
                  const isSelected = t.name === selectedTable.name;
                  return (
                    <div
                      key={t.name}
                      onClick={() => setSelectedTable(t)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-slate-800/90 border-purple-500/50 shadow-md shadow-purple-950/20'
                          : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-200">
                          <Table className="w-4 h-4 text-purple-400" />
                          <span>{t.name}</span>
                        </div>
                        <Badge variant="purple" size="sm">
                          {t.recordsCount.toLocaleString()} rows
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-800/60">
                        <span>PK: {t.primaryKey}</span>
                        <span>{t.columnsCount} columns • {t.sizeMb} MB</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Schema Detail View */}
          <div className="lg:col-span-7 space-y-4">
            <Card variant="default">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="w-5 h-5 text-purple-400" />
                    <CardTitle className="text-lg font-mono">{selectedTable.name}</CardTitle>
                  </div>
                  <Badge variant="cyan">{selectedTable.sizeMb} MB allocated</Badge>
                </div>
                <CardDescription>
                  Primary Key: {selectedTable.primaryKey} | Relational Foreign Keys: {selectedTable.relationshipsCount}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                  Column Specification & Data Types
                </div>

                <div className="border border-slate-800 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left font-mono">
                    <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Column Name</th>
                        <th className="py-2.5 px-3">Data Type</th>
                        <th className="py-2.5 px-3">Constraints</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      <tr className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-cyan-300 font-bold flex items-center gap-1.5">
                          <Key className="w-3 h-3 text-amber-400" /> id
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">UUID</td>
                        <td className="py-2.5 px-3 text-emerald-400">PRIMARY KEY, DEFAULT uuid_generate_v4()</td>
                      </tr>
                      <tr className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-slate-200">created_at</td>
                        <td className="py-2.5 px-3 text-slate-300">TIMESTAMPTZ</td>
                        <td className="py-2.5 px-3 text-slate-400">NOT NULL, DEFAULT NOW()</td>
                      </tr>
                      <tr className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-slate-200">updated_at</td>
                        <td className="py-2.5 px-3 text-slate-300">TIMESTAMPTZ</td>
                        <td className="py-2.5 px-3 text-slate-400">NOT NULL</td>
                      </tr>
                      <tr className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-indigo-300 flex items-center gap-1.5">
                          <GitFork className="w-3 h-3 text-indigo-400" /> user_id
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">UUID</td>
                        <td className="py-2.5 px-3 text-purple-400">FOREIGN KEY -&gt; users(id)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
