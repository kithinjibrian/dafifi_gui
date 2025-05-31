import MonacoEditor from '@monaco-editor/react';

export const Editor = () => {
    return (
        <div className='h-full'>
            <MonacoEditor
                height="98%"
                language={"text"}
                value={``}
                onChange={() => { }}
                theme="vs-dark"
            />
        </div>
    )
}