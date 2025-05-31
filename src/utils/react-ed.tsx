import { Message } from "@/store/message";
import { ReactRender } from "./react2";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import SyntaxHighlighter from "react-syntax-highlighter";
import { CodeNode } from "@kithinji/lml";

export class ReactED extends ReactRender {
    constructor(
        message: Message,
    ) {
        super(
            message
        );
    }

    async visitCode(
        node: CodeNode,
        args?: Record<string, any>
    ) {
        const attr = await this.visit(node.attributes);

        const code = await this.visit(node.body, args);

        return (
            <div
                key={this.get_key("code")}
                className="w-full max-w-[70vw] border rounded-md m-2 p-0 min-w-40"
            >
                <div className="bg-card border-b p-2 flex justify-between items-center">
                    <div className="flex flex-row items-center">
                        <span>{attr.lang}</span>
                    </div>
                </div>
                <SyntaxHighlighter
                    language={"rust"}
                    style={materialDark}
                    customStyle={{
                        margin: 0,
                        padding: "1rem",
                        minWidth: "100%",
                        boxSizing: "border-box"
                    }}
                >
                    {code}
                </SyntaxHighlighter>
            </div >
        )
    }
}