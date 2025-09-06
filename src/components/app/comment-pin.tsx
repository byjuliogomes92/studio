
"use client";

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/hooks/use-auth';
import type { PageComment, CommentReply, WorkspaceMember } from '@/lib/types';
import { addCommentReply, resolveCommentThread, createNotificationForMention } from '@/lib/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, MessageSquare, Check, Send } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { getWorkspaceMembers } from '@/lib/firestore';
import React from 'react';
import { useToast } from '@/hooks/use-toast';


function UserMentions({ members, onSelect }: { members: WorkspaceMember[], onSelect: (mention: string) => void }) {
    return (
        <div className="bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
            {members.map(member => (
                <div 
                    key={member.userId} 
                    onClick={() => onSelect(member.email)}
                    className="p-2 hover:bg-accent cursor-pointer text-sm flex items-center gap-2"
                >
                     <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://api.dicebear.com/8.x/thumbs/svg?seed=${member.userId}`} />
                        <AvatarFallback>{member.email[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{member.email}</span>
                </div>
            ))}
        </div>
    );
}


function CommentModal({ 
    comment, 
    isOpen, 
    onOpenChange, 
    onUpdate 
}: { 
    comment: PageComment, 
    isOpen: boolean, 
    onOpenChange: (open: boolean) => void,
    onUpdate: () => void 
}) {
    const { user, activeWorkspace } = useAuth();
    const { toast } = useToast();
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [isResolving, setIsResolving] = useState(false);
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [members, setMembers] = React.useState<WorkspaceMember[]>([]);

     React.useEffect(() => {
        if (activeWorkspace) {
            getWorkspaceMembers(activeWorkspace.id).then(setMembers);
        }
    }, [activeWorkspace]);

    const handleReply = async () => {
        if (!replyText.trim() || !user || !activeWorkspace) return;
        setIsReplying(true);
        try {
            await addCommentReply({
                pageId: comment.pageId,
                commentId: comment.id,
                userId: user.uid,
                userName: user.displayName || 'Usuário',
                userAvatarUrl: user.photoURL || '',
                text: replyText
            }, user, comment.pageId, comment.workspaceId);

            // Handle Mentions
            const mentions = replyText.match(/@([\w.-]+@[\w.-]+)/g) || [];
            if (mentions.length > 0) {
                const mentionedEmails = mentions.map(m => m.substring(1));
                await createNotificationForMention({
                    mentionedEmails,
                    pageId: comment.pageId,
                    pageName: "uma página", // Ideally we'd pass the page name here
                    workspaceId: activeWorkspace.id,
                    mentionedBy: user.displayName || user.email || 'Alguém'
                });
            }

            setReplyText('');
            onUpdate();
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Erro ao responder', description: error.message });
        } finally {
            setIsReplying(false);
        }
    };

    const handleResolve = async () => {
        if (!user) return;
        setIsResolving(true);
        try {
            await resolveCommentThread(comment.id, user.displayName || 'Usuário');
            onUpdate();
            onOpenChange(false);
        } finally {
            setIsResolving(false);
        }
    };
    
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setReplyText(text);

        const lastAt = text.lastIndexOf('@');
        if (lastAt !== -1 && !text.substring(lastAt + 1).includes(' ')) {
             setMentionQuery(text.substring(lastAt + 1));
        } else {
            setMentionQuery(null);
        }
    };

    const handleMentionSelect = (mention: string) => {
        const lastAt = replyText.lastIndexOf('@');
        const newText = replyText.substring(0, lastAt) + `@${mention} `;
        setReplyText(newText);
        setMentionQuery(null);
        textareaRef.current?.focus();
    }

    const filteredMembers = mentionQuery !== null
        ? members.filter(m => m.email.toLowerCase().includes(mentionQuery.toLowerCase()))
        : [];
    

    const allComments: (Partial<PageComment> | CommentReply)[] = [comment, ...(comment.replies || [])];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Discussão</DialogTitle>
                     {comment.resolved && (
                        <DialogDescription>
                            Resolvido por {comment.resolvedBy}
                        </DialogDescription>
                     )}
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[50vh] overflow-y-auto">
                    {allComments.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={item.userAvatarUrl} />
                                <AvatarFallback>{item.userName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm">{item.userName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.createdAt && formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true, locale: ptBR })}
                                    </p>
                                </div>
                                <p className="text-sm mt-1">{item.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <DialogFooter className="flex-col gap-2">
                    {!comment.resolved && (
                        <>
                        <div className="relative w-full">
                            <Textarea 
                                ref={textareaRef}
                                value={replyText}
                                onChange={handleTextChange}
                                placeholder="Adicione uma resposta..."
                                disabled={isReplying}
                            />
                             {mentionQuery !== null && filteredMembers.length > 0 && (
                                <div className="absolute bottom-full left-0 mb-1 w-full z-10">
                                   <UserMentions members={filteredMembers} onSelect={handleMentionSelect} />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between w-full">
                             <Button onClick={handleResolve} variant="outline" disabled={isResolving}>
                                {isResolving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4" />}
                                Marcar como Resolvido
                            </Button>
                            <Button onClick={handleReply} disabled={isReplying || !replyText.trim()}>
                                {isReplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export function CommentPin({ comment, onUpdate }: { comment: PageComment, onUpdate: () => void }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="absolute z-40 transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${comment.position.x}%`, top: `${comment.position.y}%` }}
            >
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform ${comment.resolved ? 'bg-green-500' : 'bg-yellow-400'}`}>
                    {comment.resolved ? <Check className="h-5 w-5 text-white" /> : <MessageSquare className="h-5 w-5 text-white" />}
                </div>
            </button>

            <CommentModal comment={comment} isOpen={isModalOpen} onOpenChange={setIsModalOpen} onUpdate={onUpdate} />
        </>
    );
}
