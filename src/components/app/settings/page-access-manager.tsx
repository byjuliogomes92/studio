
"use client";

import { useState } from 'react';
import type { PageAccessUser } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import { produce } from 'immer';

interface PageAccessManagerProps {
    users: PageAccessUser[];
    onUsersChange: (newUsers: PageAccessUser[]) => void;
}

export function PageAccessManager({ users, onUsersChange }: PageAccessManagerProps) {
    const [newUserIdentifier, setNewUserIdentifier] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');

    const handleAddUser = () => {
        if (!newUserIdentifier.trim() || !newUserPassword.trim()) {
            return;
        }

        const newUser: PageAccessUser = {
            id: `user-${Date.now()}`,
            identifier: newUserIdentifier,
            password: newUserPassword,
        };

        onUsersChange(produce(users, draft => {
            draft.push(newUser);
        }));

        setNewUserIdentifier('');
        setNewUserPassword('');
    };

    const handleRemoveUser = (id: string) => {
        onUsersChange(users.filter(user => user.id !== id));
    };

    return (
        <div className="space-y-4">
            <h4 className="font-medium text-sm">Gerenciar Acesso</h4>
            <div className="p-2 border rounded-md space-y-3">
                 <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <Label htmlFor="new-user-id" className="text-xs">Identificador</Label>
                        <Input 
                            id="new-user-id"
                            value={newUserIdentifier}
                            onChange={(e) => setNewUserIdentifier(e.target.value)}
                            placeholder="Ex: julio"
                        />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="new-user-pass" className="text-xs">Senha</Label>
                         <Input 
                            id="new-user-pass"
                            type="password"
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                </div>
                <Button size="sm" onClick={handleAddUser} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Usuário
                </Button>
            </div>
            <div className="space-y-2">
                <Label>Usuários com Acesso</Label>
                {users.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhum usuário adicionado.</p>
                ) : (
                    <div className="border rounded-md">
                        {users.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                                <span className="text-sm font-mono">{user.identifier}</span>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemoveUser(user.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

