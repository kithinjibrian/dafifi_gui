// Types and Interfaces
interface ConversionOptions {
    preserveWhitespace?: boolean;
    includeImages?: boolean;
    includeLinks?: boolean;
    includeTables?: boolean;
    codeLanguage?: string;
}

interface ConversionContext {
    options: Required<ConversionOptions>;
    listDepth: number;
    inTable: boolean;
    tableHeaders: string[];
    visitors: VisitorRegistry;
}

class ConversionContextImpl implements ConversionContext {
    public options: Required<ConversionOptions>;
    public listDepth: number = 0;
    public inTable: boolean = false;
    public tableHeaders: string[] = [];
    public visitors!: VisitorRegistry;

    constructor(options: ConversionOptions = {}) {
        this.options = {
            preserveWhitespace: false,
            includeImages: true,
            includeLinks: true,
            includeTables: true,
            codeLanguage: 'javascript',
            ...options
        };
    }
}

abstract class NodeVisitor {
    abstract visit(node: Node, context: ConversionContext): string;

    protected visitChildren(node: Node, context: ConversionContext): string {
        return Array.from(node.childNodes)
            .map(child => context.visitors.getVisitor(child).visit(child, context))
            .join('\n');
    }
}

class TextNodeVisitor extends NodeVisitor {
    visit(node: Node, context: ConversionContext): string {
        if (node.nodeType !== Node.TEXT_NODE) return '';

        let text = node.textContent || '';

        if (!context.options.preserveWhitespace) {
            text = text.replace(/\s+/g, ' ');
        }

        if (text === ' ') {
            return '';
        }

        return `\`${text}\``;
    }
}

// Heading Visitor
class HeadingVisitor extends NodeVisitor {
    constructor(private level: number) {
        super();
    }

    visit(node: Node, context: ConversionContext): string {
        let lml = (node as Element).getAttribute('data-lml');
        const content = this.visitChildren(node, context);

        if (lml && ["h1", "h2", "h3", "h4", "h5", "h6"].includes(lml)) {
            return `${lml} { ${content} }\n`;
        }

        return content;
    }
}

// Text Formatting Visitors
class StrongVisitor extends NodeVisitor {
    visit(node: Node, context: ConversionContext): string {
        let lml = (node as Element).getAttribute('data-lml');
        const content = this.visitChildren(node, context);

        if (lml == "b") {
            return `b { ${content} }`;
        }

        return content;
    }
}

class EmphasisVisitor extends NodeVisitor {
    visit(node: Node, context: ConversionContext): string {
        let lml = (node as Element).getAttribute('data-lml');
        const content = this.visitChildren(node, context);

        if (lml == "i") {
            return `i { ${content} }`;
        }

        return content;
    }
}

class InlineCodeVisitor extends NodeVisitor {
    visit(node: Node, context: ConversionContext): string {
        let lml = (node as Element).getAttribute('data-lml');
        const content = this.visitChildren(node, context);

        if (lml == "c") {
            return `c { ${content} }`;
        }

        return content;
    }
}

class PreCodeVisitor extends NodeVisitor {
    visit(node: Node, context: ConversionContext): string {
        let lml = (node as Element).getAttribute('data-lml');

        if (lml == "code_block") {
            const contents = [];

            for (let code of Array.from(node.childNodes)) {
                const tagName = (code as Node).nodeName.toLowerCase();

                if (tagName == "code") {
                    for (let span of Array.from(code.childNodes)) {

                        if (span.nodeName.toLowerCase() == "span") {
                            for (let text of Array.from(span.childNodes)) {
                                if (text.nodeType !== Node.TEXT_NODE) throw new Error(`Unsupported node type: ${text.nodeName}`);

                                contents.push(text.textContent);
                            }
                        } else if (span.nodeType == Node.TEXT_NODE) {
                            contents.push(span.textContent);
                        }
                    }
                }
            }

            return `\`${contents.join('')}\``;
        }

        const content = this.visitChildren(node, context);

        return content;
    }
}

// List Visitors
class UnorderedListVisitor extends NodeVisitor {
    visit(node: Node, context: ConversionContext): string {
        let lml = (node as Element).getAttribute('data-lml');
        const content = this.visitChildren(node, context);

        if (lml == "ul") {
            return `ul {\n${content}\n}`;
        }

        return content;
    }
}

class ListVisitor extends NodeVisitor {
    visit(node: Node, context: ConversionContext): string {
        let lml = (node as Element).getAttribute('data-lml');
        const content = this.visitChildren(node, context);

        if (lml == "li") {
            return `li { ${content} }`;
        }

        return content;
    }
}

// paragraph
class ParagraphVisitor extends NodeVisitor {
    visit(node: Node, context: ConversionContext): string {
        let lml = (node as Element).getAttribute('data-lml');
        const content = this.visitChildren(node, context);

        if (lml == "p") {
            return `p { ${content} }\n`;
        }

        return `${content}\n\n`;
    }
}

// Links and media
class LinkVisitor extends NodeVisitor {
    visit(node: Node, context: ConversionContext): string {
        let lml = (node as Element).getAttribute('data-lml');
        const element = node as Element;

        if (!context.options.includeLinks) {
            return this.visitChildren(node, context);
        }

        const content = this.visitChildren(node, context);
        const href = element.getAttribute('href') || '';
        const title = element.getAttribute('title');
        const titleAttr = title ? ` "${title}"` : '';

        if (lml == "link") {
            return `link[href="${href}"] { ${content} }`;
        }

        return `[${content}](${href}${titleAttr})`;
    }
}

// Simple Visitors
class LineBreakVisitor extends NodeVisitor {
    visit(node: Node, context: ConversionContext): string {
        return '\n';
    }
}


class ContainerVisitor extends NodeVisitor {
    visit(node: Node, context: ConversionContext): string {
        let lml = (node as Element).getAttribute('data-lml');
        let attr = (node as Element).getAttribute('data-attr');

        if (lml == 'code') {
            for (let div_pre of Array.from(node.childNodes)) {
                if (div_pre.nodeName.toLowerCase() == 'div') {
                    node.removeChild(div_pre);
                }
            }
        }

        const content = this.visitChildren(node, context);

        if (lml == "reason") {
            return `reason {\n${content}\n}\n`;
        } else if (lml == "answer") {
            return `answer {\n${content}\n}\n`;
        } else if (lml == "code") {
            return `code[${attr}] {\n${content}\n}`;
        }

        return content;
    }
}

type NodeType = string | 'TEXT_NODE';

class VisitorRegistry {
    public visitors = new Map<NodeType, NodeVisitor>();

    constructor() {
        this.registerDefaultVisitors();
    }

    private registerDefaultVisitors(): void {
        this.visitors.set('TEXT_NODE', new TextNodeVisitor());

        // Headings
        this.visitors.set('h1', new HeadingVisitor(1));
        this.visitors.set('h2', new HeadingVisitor(2));
        this.visitors.set('h3', new HeadingVisitor(3));
        this.visitors.set('h4', new HeadingVisitor(4));
        this.visitors.set('h5', new HeadingVisitor(5));
        this.visitors.set('h6', new HeadingVisitor(6));

        // Text formatting
        this.visitors.set('p', new ParagraphVisitor());
        this.visitors.set('strong', new StrongVisitor());
        this.visitors.set('b', new StrongVisitor());
        this.visitors.set('em', new EmphasisVisitor());
        this.visitors.set('i', new EmphasisVisitor());

        // Code
        this.visitors.set('code', new InlineCodeVisitor());
        this.visitors.set('pre', new PreCodeVisitor());

        // Lists
        this.visitors.set('ul', new UnorderedListVisitor());
        this.visitors.set('li', new ListVisitor());

        // Links and media
        this.visitors.set('a', new LinkVisitor());

        // Simple elements
        this.visitors.set('br', new LineBreakVisitor());

        // generic containers
        this.visitors.set('div', new ContainerVisitor());
        this.visitors.set('span', new ContainerVisitor());
    }

    registerVisitor(nodeType: NodeType, visitor: NodeVisitor): void {
        this.visitors.set(nodeType, visitor);
    }

    getVisitor(node: Node): NodeVisitor {
        if (node.nodeType === Node.TEXT_NODE) {
            return this.visitors.get('TEXT_NODE')!;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const tagName = element.tagName.toLowerCase();
            if (this.visitors.has(tagName)) {
                return this.visitors.get(tagName)!;
            }
        }

        throw new Error(`Unsupported node type: ${node.nodeName}`);
    }
}


export class HTMLToLML {
    private context: ConversionContext;
    private visitorRegistry: VisitorRegistry;

    constructor(options: ConversionOptions = {}) {
        this.context = new ConversionContextImpl(options);
        this.visitorRegistry = new VisitorRegistry();
        this.context.visitors = this.visitorRegistry;
    }

    convert(htmlString: string): string {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;

        return this.visitNode(tempDiv).trim();
    }

    private visitNode(node: Node): string {
        const visitor = this.visitorRegistry.getVisitor(node);
        return visitor.visit(node, this.context);
    }

    registerVisitor(nodeType: NodeType, visitor: NodeVisitor): void {
        this.visitorRegistry.registerVisitor(nodeType, visitor);
    }
}