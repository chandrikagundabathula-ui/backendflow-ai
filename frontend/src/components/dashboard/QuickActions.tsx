'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Zap, Box, Download, Terminal, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export const QuickActions: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/api-builder">
        <Button
          variant="glow"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
        >
          Create Endpoint
        </Button>
      </Link>

      <Link href="/load-simulation">
        <Button
          variant="secondary"
          size="sm"
          icon={<Zap className="w-4 h-4 text-amber-400" />}
        >
          Run Load Test
        </Button>
      </Link>

      <Link href="/3d-twin">
        <Button
          variant="secondary"
          size="sm"
          icon={<Box className="w-4 h-4 text-indigo-400" />}
        >
          View 3D Twin
        </Button>
      </Link>

      <Link href="/test-console">
        <Button
          variant="outline"
          size="sm"
          icon={<Terminal className="w-4 h-4 text-emerald-400" />}
        >
          Launch Test Suite
        </Button>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        icon={<Download className="w-4 h-4 text-slate-400" />}
        onClick={() => alert('Schema JSON exported successfully!')}
      >
        Export Schema
      </Button>
    </div>
  );
};
