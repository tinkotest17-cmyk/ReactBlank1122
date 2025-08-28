import { ArrowRightLeft } from 'lucide-react';
import BalanceConverter from '@/components/BalanceConverter';

export default function Convert() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ArrowRightLeft className="h-6 w-6 text-slate-600" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Balance Converter</h1>
      </div>
      
      <div className="max-w-md mx-auto">
        <BalanceConverter />
      </div>
    </div>
  );
}
