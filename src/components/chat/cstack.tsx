'use client';

import { Button } from '@/components/ui/button';
import { useCStackStore } from '@/store/cstack';
import { ChevronLeft, ChevronRight, Scroll } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { ReactED } from '@/utils/react2';

const Message = ({ message }: { message: string }) => {
    const [renderedComponents, setRenderedComponents] = useState<any[]>([]);

    useEffect(() => {
        let a = async () => {
            try {
                const { react } = await new ReactED(
                    { message }
                ).run();

                setRenderedComponents(react);
            } catch (e: any) {
                setRenderedComponents([
                    <div
                        key={"error-1"}
                        className="text-red-500">
                        <h2 key={"error-2"} className="text-2xl">Failed to render response</h2>
                        <p key={"error-3"}>Error: {e.message}</p>
                    </div>
                ]);
            }
        };
        a();
    }, [message]);

    return (
        <>
            {renderedComponents}
        </>
    );
}

export default function CStackViewer() {
    const { stack, index } = useCStackStore();
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        setCurrent(index - 1);
    }, [index]);

    const goLeft = () => {
        setCurrent(prev => Math.max(prev - 1, 0));
    };

    const goRight = () => {
        setCurrent(prev => Math.min(prev + 1, stack.length - 1));
    };

    if (stack.length === 0) return null;

    return (
        <Card className="bg-card rounded-4xl p-4 flex flex-col items-center gap-4">
            <CardContent className="w-full">
                <ScrollArea className="h-80">
                    <Message message={stack[current]} />
                </ScrollArea>
            </CardContent>
            <div className="flex items-center justify-between w-full">
                <Button variant="ghost" onClick={goLeft} disabled={current === 0}>
                    <ChevronLeft />
                </Button>
                <span className="text-sm text-muted-foreground">
                    {current + 1} of {stack.length}
                </span>
                <Button variant="ghost" onClick={goRight} disabled={current === stack.length - 1}>
                    <ChevronRight />
                </Button>
            </div>
        </Card>
    );
}
