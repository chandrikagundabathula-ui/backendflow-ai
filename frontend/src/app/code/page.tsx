'use client';

import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Code2, Copy, Download, FileCode, Folder, ChevronRight, Check } from 'lucide-react';

export default function CodePage() {
  const [selectedFile, setSelectedFile] = useState('app/routers/orders.py');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Code2 className="w-6 h-6 text-cyan-400" /> Generated Code Studio
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Production-ready FastAPI boilerplate, Pydantic models, and SQLAlchemy ORM code
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy File'}
            </Button>
            <Button variant="glow" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
              Download Zip
            </Button>
          </div>
        </div>

        {/* Code Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Tree */}
          <div className="lg:col-span-4 space-y-3">
            <Card variant="default">
              <CardHeader className="py-3">
                <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Project Code Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 text-xs font-mono space-y-1">
                {[
                  'app/main.py',
                  'app/config.py',
                  'app/routers/orders.py',
                  'app/routers/products.py',
                  'app/models/schemas.py',
                  'app/db/session.py',
                ].map((filePath) => {
                  const isSelected = filePath === selectedFile;
                  return (
                    <div
                      key={filePath}
                      onClick={() => setSelectedFile(filePath)}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-slate-800 text-cyan-300 font-semibold border border-cyan-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <FileCode className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span>{filePath}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Code View */}
          <div className="lg:col-span-8">
            <Card variant="default">
              <CardHeader className="py-3 bg-slate-950 flex flex-row items-center justify-between border-b border-slate-800">
                <span className="font-mono text-xs font-bold text-slate-200">{selectedFile}</span>
                <Badge variant="cyan" size="sm">FastAPI v0.110</Badge>
              </CardHeader>

              <CardContent className="p-4 bg-slate-950/90 font-mono text-xs overflow-x-auto">
                <pre className="text-slate-200 leading-relaxed">
{`from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db_session
from app.models.schemas import OrderCreate, OrderResponse
from app.services import order_service

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db_session)
):
    """
    Creates a new checkout order atomically with stock verification.
    """
    try:
        order = await order_service.process_order(db, payload)
        return order
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
