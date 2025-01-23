import React, { useState } from 'react';
import { RecipeStatus } from '../types/kanban';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface StatusManagerProps {
  onStatusChange: (statuses: string[]) => void;
}

export function StatusManager({ onStatusChange }: StatusManagerProps) {
  const [statuses, setStatuses] = useState<string[]>(Object.values(RecipeStatus));
  const [newStatus, setNewStatus] = useState('');

  const addStatus = () => {
    if (newStatus && !statuses.includes(newStatus)) {
      const updatedStatuses = [...statuses, newStatus.toUpperCase()];
      setStatuses(updatedStatuses);
      onStatusChange(updatedStatuses);
      setNewStatus('');
    }
  };

  const removeStatus = (status: string) => {
    const updatedStatuses = statuses.filter(s => s !== status);
    setStatuses(updatedStatuses);
    onStatusChange(updatedStatuses);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Recipe Statuses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              placeholder="Add new status..."
              className="flex-1"
            />
            <Button onClick={addStatus}>Add</Button>
          </div>
          <div className="space-y-2">
            {statuses.map((status) => (
              <div key={status} className="flex items-center justify-between p-2 bg-secondary rounded">
                <span>{status}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeStatus(status)}
                  disabled={status === RecipeStatus.DORMANT} // Prevent removing DORMANT status
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 