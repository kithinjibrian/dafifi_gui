import { Button } from "@/components/ui/button";
import { Context, Extension, Parser, Token, TokenType } from "@kithinji/md"
import { Copy, Pencil, Play } from "lucide-react";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";


export interface ReactContext extends Context {
    elementStack: any[],
    reactKey: number,
    code: any[]
}

export class ReactExtension implements Extension {
    public name = 'HtmlExtension';
    public handlers = this._createHandlers();

    constructor(
        public options = {}
    ) {
    }

    init(parser: Parser) {
        // Nothing to initialize
    }

    beforeProcess(context: ReactContext) {
        context.code = [];
        context.result = [];
        context.elementStack = [];
        context.reactKey = 0;
    }

    afterProcess(context: ReactContext) {
        // Cleanup any unclosed tags if needed
    }

    _createHandlers(): Record<string, any> {
        return {
            [TokenType.HEADING]: (token: Token, context: ReactContext) => {
                const HeadingTag = `h${token.level}`;
                context.result.push(
                    React.createElement(
                        HeadingTag,
                        { key: `heading-${context.reactKey++}` },
                        ...this._processInlineTokens(token.content, context)
                    )
                );
            },

            [TokenType.PARAGRAPH]: (token: Token, context: ReactContext) => {
                context.result.push(
                    React.createElement(
                        'p',
                        { key: `paragraph-${context.reactKey++}` },
                        ...this._processInlineTokens(token.content, context)
                    )
                );
            },

            [TokenType.CODE_BLOCK]: (token: Token, context: ReactContext) => {
                if (token.run)
                    context.code.push(token.content)
                context.result.push(
                    <div
                        key={`code-${context.reactKey++}`}
                        className="border rounded-md m-2 p-0 min-w-40"
                    >
                        <div className="bg-card border-b p-2 flex justify-between items-center">
                            <span>{token.language}</span>
                            <div className="flex space-x-2">
                                {token.language == "lugha" && (
                                    <Button
                                        variant={"ghost"}
                                        className="text-white p-1 rounded"
                                        onClick={() => { /* Implement copy functionality here */ }}
                                    >
                                        <Play />
                                        Run
                                    </Button>
                                )}
                                <Button
                                    variant={"ghost"}
                                    className="text-white p-1 rounded"
                                    onClick={() => { /* Implement copy functionality here */ }}
                                >
                                    <Copy />
                                    Copy
                                </Button>
                                <Button
                                    variant={"ghost"}
                                    className="text-white p-1 rounded"
                                    onClick={() => {  }}
                                >
                                    <Pencil />
                                    Edit
                                </Button>
                            </div>
                        </div>
                        <SyntaxHighlighter
                            language={token.language == "lugha" ? "rust" : token.language}
                            style={materialDark}
                            customStyle={{ margin: "0" }}
                        >
                            {token.content}
                        </SyntaxHighlighter>
                    </div >
                );
            },

            [TokenType.BLOCKQUOTE]: (token: Token, context: ReactContext) => {
                context.result.push(
                    React.createElement(
                        'blockquote',
                        { key: `blockquote-${context.reactKey++}` },
                        ...this._processInlineTokens(token.content, context)
                    )
                );
            },

            [TokenType.HORIZONTAL_RULE]: (token: Token, context: ReactContext) => {
                context.result.push(
                    React.createElement('hr', { key: `hr-${context.reactKey++}` })
                );
            },

            [TokenType.LIST_START]: (token: Token, context: ReactContext) => {
                // We'll store the list items here until the list ends
                context.elementStack.push({
                    type: token.listType,
                    items: [],
                    key: context.reactKey++
                });
            },

            [TokenType.UNORDERED_LIST_ITEM]: (token: Token, context: ReactContext) => {
                const currentList = context.elementStack[context.elementStack.length - 1];

                if (currentList && currentList.type === 'ul') {
                    currentList.items.push(
                        React.createElement(
                            'li',
                            { key: `li-${context.reactKey++}` },
                            ...this._processInlineTokens(token.content, context)
                        )
                    );
                }
            },

            [TokenType.ORDERED_LIST_ITEM]: (token: Token, context: ReactContext) => {
                const currentList = context.elementStack[context.elementStack.length - 1];

                if (currentList && currentList.type === 'ol') {
                    currentList.items.push(
                        React.createElement(
                            'li',
                            { key: `li-${context.reactKey++}`, className: "list-inside list-decimal" },
                            ...this._processInlineTokens(token.content, context)
                        )
                    );
                }
            },

            [TokenType.LIST_END]: (token: Token, context: ReactContext) => {
                const listData = context.elementStack.pop();
                context.result.push(
                    React.createElement(
                        token.listType ?? "ul",
                        { key: `list-${listData.key}`, className: "list-disc list-inside" },
                        ...listData.items
                    )
                );
            },

            [TokenType.LINE_BREAK]: (token: Token, context: ReactContext) => {
                context.result.push(
                    <br key={`br-${context.reactKey++}`} />
                );
            }
        };
    }

    _processInlineTokens(tokens: Token[], context: ReactContext): any {
        if (!tokens || !Array.isArray(tokens)) {
            return '';
        }

        return tokens.map(token => {
            switch (token.type) {
                case TokenType.BOLD:
                    return React.createElement(
                        'strong',
                        { key: `bold-${context.reactKey++}` },
                        ...this._processInlineTokens(token.content, context)
                    );

                case TokenType.ITALIC:
                    return React.createElement(
                        'em',
                        { key: `italic-${context.reactKey++}` },
                        ...this._processInlineTokens(token.content, context)
                    );

                case TokenType.CODE_INLINE:
                    return React.createElement(
                        'code',
                        { key: `inline-code-${context.reactKey++}` },
                        token.content
                    );

                case TokenType.LINK:
                    return React.createElement(
                        'a',
                        {
                            key: `link-${context.reactKey++}`,
                            href: token.url
                        },
                        token.text
                    );

                case TokenType.IMAGE:
                    return React.createElement(
                        'img',
                        {
                            key: `image-${context.reactKey++}`,
                            src: token.url,
                            alt: token.alt
                        }
                    );

                case TokenType.TEXT:
                    return token.content;

                default:
                    return '';
            }
        });
    }
}