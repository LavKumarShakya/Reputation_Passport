import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  Users, Award, Link2, DollarSign, TrendingUp, 
  AlertTriangle, BarChart3, Activity 
} from 'lucide-react';

const stats = [
  { label: 'Active Users (30d)', value: '12,847', change: '+12%', icon: Users },
  { label: 'Certificates Issued', value: '45,231', change: '+8%', icon: Award },
  { label: 'On-Chain Transactions', value: '89,445', change: '+15%', icon: Link2 },
  { label: 'Monthly Revenue', value: '$45,890', change: '+22%', icon: DollarSign },
];

const topInstitutions = [
  { name: 'Coursera', issued: 12450, verified: 98.2 },
  { name: 'Ethereum Foundation', issued: 8320, verified: 99.8 },
  { name: 'AWS', issued: 6780, verified: 97.5 },
  { name: 'freeCodeCamp', issued: 5430, verified: 96.1 },
];

export default function AdminPage() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-7xl space-y-8"
        >
          {/* Header */}
          <div>
            <h1 className="font-heading text-3xl font-bold">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              System analytics and management
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl glass p-6"
              >
                <div className="flex items-center justify-between">
                  <stat.icon className="h-8 w-8 text-primary" />
                  <span className="flex items-center gap-1 text-sm font-medium text-accent">
                    <TrendingUp className="h-4 w-4" />
                    {stat.change}
                  </span>
                </div>
                <p className="mt-4 stat-number text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Chart placeholder */}
            <div className="rounded-2xl glass p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-xl font-semibold">User Growth</h2>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex h-64 items-end gap-2">
                {[40, 55, 45, 70, 65, 80, 75, 90, 85, 95, 88, 100].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05 }}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-primary to-purple-500"
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>Jan</span>
                <span>Dec</span>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="rounded-2xl glass p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-xl font-semibold">Recent Activity</h2>
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-4">
                {[
                  { action: 'New user registered', user: 'john.eth', time: '2 min ago', type: 'user' },
                  { action: 'Certificate issued', user: 'Coursera', time: '5 min ago', type: 'cert' },
                  { action: 'Verification completed', user: 'recruiter@company.com', time: '12 min ago', type: 'verify' },
                  { action: 'Flagged content', user: 'system', time: '1 hour ago', type: 'flag' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-lg bg-secondary/50 p-3">
                    <div className={`h-2 w-2 rounded-full ${
                      item.type === 'user' ? 'bg-accent' :
                      item.type === 'cert' ? 'bg-primary' :
                      item.type === 'verify' ? 'bg-purple-500' :
                      'bg-destructive'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.user}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Institutions */}
          <div className="rounded-2xl glass p-6">
            <h2 className="mb-4 font-heading text-xl font-semibold">Top Institutions</h2>
            <div className="overflow-hidden rounded-xl">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-sm text-muted-foreground">
                    <th className="p-4">Institution</th>
                    <th className="p-4">Certificates Issued</th>
                    <th className="p-4">Verification Rate</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topInstitutions.map(inst => (
                    <tr key={inst.name} className="border-b border-border/50">
                      <td className="p-4 font-medium">{inst.name}</td>
                      <td className="p-4 stat-number">{inst.issued.toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                            <div 
                              className="h-full bg-accent"
                              style={{ width: `${inst.verified}%` }}
                            />
                          </div>
                          <span className="text-sm">{inst.verified}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-accent/20 px-2 py-1 text-xs font-medium text-accent">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts */}
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <div>
                <h3 className="font-heading text-lg font-semibold">3 Issues Require Attention</h3>
                <p className="text-sm text-muted-foreground">
                  There are flagged certificates and verification issues pending review.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
