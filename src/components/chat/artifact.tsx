import Editor from '@monaco-editor/react';
import { useEffect } from 'react';

export const Artifact = (panelRef: any) => {
    useEffect(() => {
        panelRef.current.collapse()
    }, []);

    return (
        <div className='h-full w-full'>
            <Editor
                height="100%"
                defaultLanguage="javascript"
                defaultValue=""
                theme="vs-dark"
            />
        </div>
    )
}