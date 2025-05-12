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
    NumberNode,
    OlNode,
    ParagraphNode,
    SinkholeNode,
    StringNode
} from "@kithinji/lml";

import { exec } from "@kithinji/tlugha-browser"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SyntaxHighlighter from "react-syntax-highlighter";
import { ChevronDown, Copy, Pencil, Play } from "lucide-react";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useCodeStore } from "@/store/code";
import { Message } from "@/store/message";
import { useTextStore } from "@/store/text";
import { open_artifact } from "@/components/utils/artifacts";

export class ReactRender implements LmlASTVisitor {
    private extensions: Extension<any>[] = [];
    private key: number = 0;
    private no_code = 0;

    private get_key(name: string) {
        return `${name}-${this.key++}`
    }

    constructor(
        public message: Message,
        public chat_id: string = "",
        public save: boolean = false,
        public state: Record<string, any> = {
            mobile: [false, () => { }],
            hideCode: [false, () => { }]
        }
    ) {}

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

    public async visit(node?: ASTNode, args?: Record<string, any>): Promise<any> {
        if (node == undefined) return "";

        return await node.accept(this, args);
    }

    public async run() {
        try {
            const ast = await lml(this.message.message);
            const react = await this.visit(ast)
            if (this.save) {
                const exec = useCodeStore.getState().exec;
                exec(this.chat_id, this.message.id!)
            }
            return {
                react
            };
        } catch (e) {
            throw e;
        }
    }

    async visitDocument(
        node: DocumentNode,
        args?: Record<string, any>
    ) {
        return (
            <div>
                {await this.visit(node.document, args)}
            </div>
        );
    }

    async visitElementList(
        node: ElementListNode,
        args?: Record<string, any>
    ) {
        const arr = []

        for (const src of node.sources) {
            arr.push(await this.visit(src, args))
        }

        return arr;
    }

    async visitReason(
        node: SinkholeNode,
        args?: Record<string, any>
    ) {
        return (
            <div
                key={this.get_key("reason")}
                className="my-2 border-l-10 rounded-r-3xl border-sky-700 text-gray-500 bg-background">
                <div className="p-4">
                    {await this.visit(node.body, args)}
                </div>
            </div>
        )
    }

    async visitAnswer(
        node: SinkholeNode,
        args?: Record<string, any>
    ) {
        return (
            <div
                key={this.get_key("answer")}>
                {await this.visit(node.body, args)}
            </div>
        )
    }

    async visitBlock(
        node: BlockNode,
        args?: Record<string, any>
    ) {
        const arr = []

        for (const src of node.body) {
            arr.push(await this.visit(src, args))
        }

        return arr;
    }

    async visitH1(
        node: H1Node,
        args?: Record<string, any>
    ) {
        return (
            <h1
                key={this.get_key("h1")}
                className="mb-2 text-4xl">
                {await this.visit(node.body, args)}
            </h1>
        )
    }

    async visitH2(
        node: H1Node,
        args?: Record<string, any>
    ) {
        return (
            <h2
                key={this.get_key("h2")}
                className="mb-2 text-3xl">
                {await this.visit(node.body, args)}
            </h2>
        )
    }

    async visitH3(
        node: H1Node,
        args?: Record<string, any>
    ) {
        return (
            <h3
                key={this.get_key("h3")}
                className="mb-2 text-2xl">
                {await this.visit(node.body, args)}
            </h3>
        )
    }

    async visitH4(
        node: H1Node,
        args?: Record<string, any>
    ) {
        return (
            <h4
                key={this.get_key("h4")}
                className="mb-2 text-xl">
                {await this.visit(node.body, args)}
            </h4>
        )
    }

    async visitH5(
        node: H1Node,
        args?: Record<string, any>
    ) {
        return (
            <h5
                key={this.get_key("h5")}
                className="mb-2 text-lg">
                {await this.visit(node.body, args)}
            </h5>
        )
    }

    async visitH6(
        node: H1Node,
        args?: Record<string, any>
    ) {
        return (
            <h6
                key={this.get_key("h6")}
                className="mb-2 text-base">
                {await this.visit(node.body, args)}
            </h6>
        )
    }

    async visitParagraph(
        node: ParagraphNode,
        args?: Record<string, any>
    ) {
        return (
            <p
                key={this.get_key("p")}
                className="mb-3" >
                {await this.visit(node.body, args)}
            </p >
        )
    }

    async visitOl(
        node: OlNode,
        args?: Record<string, any>
    ) {
        return (
            <ol
                key={this.get_key("ol")}
                className="list-decimal list-inside"
            >
                {await this.visit(node.body, args)}
            </ol>
        )
    }

    async visitUl(
        node: OlNode,
        args?: Record<string, any>
    ) {
        return (
            <ul
                key={this.get_key("ul")}
                className="list-disc list-inside"
            >
                {await this.visit(node.body, args)}
            </ul>
        )
    }

    async visitLi(
        node: LiNode,
        args?: Record<string, any>
    ) {
        return (
            <li
                key={this.get_key("li")} >
                {await this.visit(node.body, args)}
            </li>
        )
    }

    async visitB(node: BNode, args?: Record<string, any>) {
        const body = await this.visit(node.body, args);
        return (
            <strong key={this.get_key("strong")}>
                {body}
            </strong>
        );
    }

    async visitI(
        node: INode,
        args?: Record<string, any>
    ) {
        const body = await this.visit(node.body, args);
        return (
            <em
                key={this.get_key("em")} >
                {body}
            </em>
        )
    }

    async visitC(node: CNode, args?: Record<string, any>) {
        const body = await this.visit(node.body, args);
        return (
            <code
                className="px-1 rounded border font-mono text-sm"
                key={this.get_key("em")}
            >
                {body}
            </code>
        )
    }

    async visitButton(
        node: ButtonNode,
        args?: Record<string, any>
    ) {
        const attr = await this.visit(node.attributes);

        return (
            <Button
                key={this.get_key("button")}
                variant={"outline"}
                className="rounded-full"
                onClick={async () => {
                    for (const [key, value] of Object.entries(attr)) {
                        if (key == "onclick") {
                            await this.exec(`fun main(): unit {
                                ${value as string}
                            }`);
                        }
                    }
                }}
            >
                {await this.visit(node.body, args)}
            </Button>
        )
    }

    async visitInput(
        node: InputNode,
        args?: Record<string, any>
    ) {
        return (
            <Input
                key={await this.get_key("input")} />
        )
    }

    async visitLink(
        node: LinkNode,
        args?: Record<string, any>
    ) {
        const attr = await this.visit(node.attributes);
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

    async visitImg(
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

    async visitString(
        node: StringNode,
        args?: Record<string, any>
    ) {
        return node.value;
    }

    async visitNumber(
        node: NumberNode,
        args?: Record<string, any>
    ) {
        return node.value
    }

    async visitIdentifier(node: IdentifierNode, args?: Record<string, any>) {
        return node.name
    }

    async visitCode(
        node: CodeNode,
        args?: Record<string, any>
    ) {
        this.no_code++;

        const n = this.no_code - 1;

        const [hideCode, setHideCode] = this.state.hideCode;

        const mobile = this.state.mobile[0];
        const attr = await this.visit(node.attributes);

        const code = await this.visit(node.body, args);

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
                    <div className="flex flex-row items-center">
                        <Button
                            variant={"ghost"}
                            className="text-white p-1 rounded"
                            onClick={() => {
                                setHideCode(n)
                            }}
                        >
                            <ChevronDown />
                        </Button>
                        <span>{attr.lang}</span>
                    </div>
                    <div className="flex space-x-1">
                        {attr.run && (
                            <Button
                                variant={"ghost"}
                                className="text-white p-1 rounded"
                                onClick={() => { /* Implement copy functionality here */ }}
                            >
                                <Play />
                            </Button>
                        )}
                        <Button
                            variant={"ghost"}
                            className="text-white p-1 rounded"
                            onClick={() => { /* Implement copy functionality here */ }}
                        >
                            <Copy />
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
                        </Button>
                    </div>
                </div>
                {hideCode[n] && (
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
                )}
            </div >
        )
    }

    async visitAttributeList(node: AttributeListNode) {
        let array = [];

        for (const attrs of node.attributes) {
            array.push(await this.visit(attrs))
        }

        return Object.assign({}, ...array);
    }

    async visitAttribute(node: AttributeNode) {
        let key = await this.visit(node.key);
        let value = await this.visit(node.value);

        return {
            [key]: value
        }
    }

    async visitSinkhole(
        node: SinkholeNode,
        args?: Record<string, any>
    ) {
        switch (node.name) {
            case "answer":
                return await this.visitAnswer(node, args);
            case "reason":
                return await this.visitReason(node, args);
        }
        return;
    }

    async exec(code: string) {
        await exec({
            code: code,
            std: "https://chat.dafifi.net"
        });
    }
}