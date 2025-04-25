import React from "react";
import {
    ASTNode,
    AttributeListNode,
    AttributeNode,
    BlockNode,
    BNode,
    ButtonNode,
    CNode,
    CodeNode,
    DocumentNode,
    ElementListNode,
    Extension,
    H1Node,
    IdentifierNode,
    ImageNode,
    INode,
    InputNode,
    LinkNode,
    LiNode,
    lml,
    LmlASTVisitor,
    NoSpaceNode,
    NumberNode,
    OlNode,
    ParagraphNode,
    SinkholeNode,
    StringNode
} from "@kithinji/lml";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SyntaxHighlighter from "react-syntax-highlighter";
import { Copy, Pencil, Play } from "lucide-react";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useCodeStore } from "@/store/code";
import { Message } from "@/store/message";
import { useTextStore } from "@/store/text";
import { open_artifact } from "@/components/utils/artifacts";
import { useIsMobile } from "@/hooks/use-mobile";

export class ReactRender implements LmlASTVisitor {
    private extensions: Extension<any>[] = [];
    private key: number = 0;

    private get_key(name: string) {
        return `${name}-${this.key++}`
    }

    constructor(
        public message: Message,
        public chat_id: string = "",
        public save: boolean = false
    ) { }

    public extension(p: Extension<any>) {
        this.extensions.push(p);
        return this;
    }

    public before_accept(
        node: ASTNode,
        args?: Record<string, any>
    ) {
        //console.log(node.type)
        this.extensions.forEach(extension => extension.beforeAccept?.(node, this, args));
    }

    public visit(node?: ASTNode, args?: Record<string, any>): any {
        if (node == undefined) return "";

        return node.accept(this, args);
    }

    public run() {
        try {
            const ast = lml(this.message.message);
            const react = this.visit(ast)
            if (this.save) {
                const exec = useCodeStore.getState().exec;
                exec(this.chat_id)
            }
            return {
                react
            };
        } catch (e) {
            throw e;
        }
    }

    visitDocument(
        node: DocumentNode,
        args?: Record<string, any>
    ) {
        return (
            <div>
                {this.visit(node.document, args)}
            </div>
        );
    }

    visitElementList(
        node: ElementListNode,
        args?: Record<string, any>
    ) {
        return node.sources
            .map(src => this.visit(src, args))
    }

    visitBlock(
        node: BlockNode,
        args?: Record<string, any>
    ) {
        return node.body
            .map(src => this.visit(src, args));
    }

    visitH1(
        node: H1Node,
        args?: Record<string, any>
    ) {
        return (
            <h1
                key={this.get_key("h1")}
                className="mb-2 text-4xl">
                {this.visit(node.body, args)}
            </h1>
        )
    }

    visitH2(
        node: H1Node,
        args?: Record<string, any>
    ) {
        return (
            <h2
                key={this.get_key("h2")}
                className="mb-2 text-3xl">
                {this.visit(node.body, args)}
            </h2>
        )
    }

    visitH3(
        node: H1Node,
        args?: Record<string, any>
    ) {
        return (
            <h3
                key={this.get_key("h3")}
                className="mb-2 text-2xl">
                {this.visit(node.body, args)}
            </h3>
        )
    }

    visitH4(
        node: H1Node,
        args?: Record<string, any>
    ) {
        return (
            <h4
                key={this.get_key("h4")}
                className="mb-2 text-xl">
                {this.visit(node.body, args)}
            </h4>
        )
    }

    visitH5(
        node: H1Node,
        args?: Record<string, any>
    ) {
        return (
            <h5
                key={this.get_key("h5")}
                className="mb-2 text-lg">
                {this.visit(node.body, args)}
            </h5>
        )
    }

    visitH6(
        node: H1Node,
        args?: Record<string, any>
    ) {
        return (
            <h6
                key={this.get_key("h6")}
                className="mb-2 text-base">
                {this.visit(node.body, args)}
            </h6>
        )
    }

    visitParagraph(
        node: ParagraphNode,
        args?: Record<string, any>
    ) {
        return (
            <p
                key={this.get_key("p")}
                className="mb-3" >
                {this.visit(node.body, args)}
            </p >
        )
    }

    visitOl(
        node: OlNode,
        args?: Record<string, any>
    ) {
        return (
            <ol
                key={this.get_key("ol")}
                className="list-decimal list-inside"
            >
                {this.visit(node.body, args)}
            </ol>
        )
    }

    visitUl(
        node: OlNode,
        args?: Record<string, any>
    ) {
        return (
            <ul
                key={this.get_key("ul")}
                className="list-disc list-inside"
            >
                {this.visit(node.body, args)}
            </ul>
        )
    }

    visitLi(
        node: LiNode,
        args?: Record<string, any>
    ) {
        return (
            <li
                key={this.get_key("li")} >
                {this.visit(node.body, args)}
            </li>
        )
    }

    visitB(node: BNode, args?: Record<string, any>) {
        const body = this.visit(node.body, args);
        return (
            <strong key={this.get_key("strong")}>
                {node.no_space ? body : `\u00A0${body}`}
            </strong>
        );
    }

    visitI(
        node: INode,
        args?: Record<string, any>
    ) {
        const body = this.visit(node.body, args);
        return (
            <em
                key={this.get_key("em")} >
                {node.no_space ? body : `\u00A0${body}`}
            </em>
        )
    }

    visitC(node: CNode, args?: Record<string, any>) {
        const body = this.visit(node.body, args);
        return (
            node.no_space ? (
                <code
                    className="px-1 rounded border font-mono text-sm"
                    key={this.get_key("em")}
                >
                    {body}
                </code>
            ) : (
                <span
                    key={this.get_key("em")}
                >
                    {" "}
                    <code
                        className="px-1 rounded border font-mono text-sm"
                    >
                        {body}
                    </code>
                </span>
            )
        )
    }

    visitButton(
        node: ButtonNode,
        args?: Record<string, any>
    ) {
        const attr = this.visit(node.attributes);

        return (
            <Button
                key={this.get_key("button")}
                variant={"outline"}
                className="rounded-full"
            >
                {this.visit(node.body, args)}
            </Button>
        )
    }

    visitInput(
        node: InputNode,
        args?: Record<string, any>
    ) {
        return (
            <Input
                key={this.get_key("input")} />
        )
    }

    visitLink(
        node: LinkNode,
        args?: Record<string, any>
    ) {
        const attr = this.visit(node.attributes);
        return (
            <a
                target="_blank"
                href={attr.href}
                key={this.get_key("a")}
                className="text-blue-500 hover:underline">
                {this.visit(node.body, args)}
            </a>
        )
    }

    visitImg(
        node: ImageNode,
        args?: Record<string, any>
    ) {
        return (
            <img
                src=""
                key={this.get_key("a")}>
            </img>
        )
    }

    visitNoSpace(
        node: NoSpaceNode,
        args?: Record<string, any>
    ) {
        this.visit(node.body);
    }

    visitString(
        node: StringNode,
        args?: Record<string, any>
    ) {
        return node.value;
    }

    visitNumber(
        node: NumberNode,
        args?: Record<string, any>
    ) {
        return node.value
    }

    visitIdentifier(node: IdentifierNode, args?: Record<string, any>) {
        return node.name
    }

    visitCode(
        node: CodeNode,
        args?: Record<string, any>
    ) {
        const mobile = useIsMobile();
        const attr = this.visit(node.attributes);

        const code = this.visit(node.body, args);

        if (this.save) {
            if (attr.lang === "lugha" && attr.run == "true") {
                const push = useCodeStore.getState().push;
                push(code);
            }
        }

        return (
            <div
                key={this.get_key("code")}
                className="w-full max-w-[70vw] border rounded-md m-2 p-0 min-w-40"
            >
                <div className="bg-card border-b p-2 flex justify-between items-center">
                    <span>{attr.lang}</span>
                    <div className="flex space-x-2">
                        {attr.run && (
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
                            onClick={() => {
                                const write = useTextStore.getState().write;
                                write(code[0]);
                                open_artifact(mobile, {
                                    artifact: "coder",
                                    async save() {
                                    }
                                })
                            }}
                        >
                            <Pencil />
                            Edit
                        </Button>
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

    visitAttributeList(node: AttributeListNode) {
        let array = node.attributes.map(attrs => this.visit(attrs));
        return Object.assign({}, ...array);
    }

    visitAttribute(node: AttributeNode) {
        let key = this.visit(node.key);
        let value = this.visit(node.value);

        switch (key) {
            case "onclick":
                this.exec(value);
                break;
        }

        return {
            [key]: value
        }
    }

    visitSinkhole(node: SinkholeNode, args?: Record<string, any>) {
        return;
    }

    exec(code: string) {
        //  console.log(code);
    }
}