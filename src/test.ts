// Welcome to the TypeScript Playground, this is a website
// which gives you a chance to write, share and learn TypeScript.

// You could think of it in three ways:
//
//  - A place to learn TypeScript in a place where nothing can break
//  - A place to experiment with TypeScript syntax, and share the URLs with others
//  - A sandbox to experiment with different compiler features of TypeScript
// To learn more about the language, click above in "Examples" or "What's New".
// Otherwise, get started by removing these comments and the world is your playground.
  
class TreeNode {
    private bandMbps: number
    private children: TreeNode[] = []
    
    constructor(bandMbps: number) {
        this.bandMbps = bandMbps
    }

    public buildTree(nodes:TreeNode[], streamMbps:number, layer:number) {
        console.log(`[${layer}] : ${nodes.length}`)
        if (layer > 0) {
            console.log(` [${layer}] : ${this.children.length}`)
            this.children.forEach(c => console.log(c))
            this.children.forEach(c => c.buildTree(nodes, streamMbps, layer-1))
        } else {
            let mbps = 0
            while (nodes.length > 0) {
                const n = nodes.shift()
                console.log(` [${layer}] : ${nodes.length} ${n}`)
                if (n != undefined) {
                    this.children.push(n)
                }
                mbps += streamMbps
                if (mbps >= this.bandMbps) break
            }
        }
    }
    public printTree(indent: String = "", layer:number = 0) {
        if (this.children.length > 0 && this.children[0].children.length <= 0) {
            console.log(`[${layer}]${indent}${this.bandMbps}Mbps .. ${this.children.length} children`)
        } else {
            console.log(`[${layer}]${indent}${this.bandMbps}Mbps`)
            this.children.forEach(c => c.printTree(indent + "  ", layer+1))
        }
    }
}

const server = new TreeNode(2)
const a = new Array(7);
console.log(`${a.length} ${server}`)
const b : TreeNode[] = [];
a.forEach(() => b.push(new TreeNode(2)))
console.log(`${b.length} ${b[0]}`)
b.forEach(c => console.log(`${c}`))
const clients = Array(7).map(() => new TreeNode(2))
console.log(`${clients[0]}`)

// let layer = 0
// while (clients.length > 0) {
//     server.buildTree(clients, 1, layer)
//     layer++
//     if (layer > 1) break
// }

// console.log(`max layer = ${layer}`)
//server.printTree()
