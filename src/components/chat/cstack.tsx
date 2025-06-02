'use client';

import { Button } from '@/components/ui/button';
import { useCStackStore } from '@/store/cstack';
import {  ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { ReactED } from '@/utils/react2';

const Message = ({
    message,
    ref
}: {
    message: string,
    ref: any
}) => {
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
        <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning={true}
            className="outline-none min-h-full"
            role="textbox"
            aria-label="Code editor output"
        >
            {renderedComponents}
        </div>
    );
}

export default function CStackViewer(
    {
        ref,
        current,
        setCurrent
    }: {
        ref: any,
        current: number,
        setCurrent: (_: any) => void
    }
) {
    const { stack, index } = useCStackStore();

    useEffect(() => {
        setCurrent(index - 1);
    }, [index]);

    const goLeft = () => {
        setCurrent((prev: number) => Math.max(prev - 1, 0));
    };

    const goRight = () => {
        setCurrent((prev: number) => Math.min(prev + 1, stack.length - 1));
    };

    if (stack.length === 0) return null;

    return (
        <Card className="w-full p-4 flex flex-col items-center gap-4">
            <CardContent className="w-full">
                <ScrollArea className="h-80">
                    <Message ref={ref} message={stack[current]} />
                </ScrollArea>
            </CardContent>
            <div className='flex flex-row w-full justify-between'>
                <div>
                </div>
                <div className="flex items-center">
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
            </div>
        </Card>
    );
}
