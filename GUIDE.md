# Quick Start Guide 🚀

## Welcome to the HNSW Algorithm Visualizer!

This guide will help you get started with exploring the three proximity search algorithms.

## 🎯 Quick Overview

### **What are these algorithms?**

1. **Skip List**: A probabilistic data structure that allows O(log n) search by maintaining multiple "express lanes" at different levels.

2. **NSW (Navigable Small World)**: A graph-based approach where nodes are connected to their M nearest neighbors, creating a "small world" network for efficient searching.

3. **HNSW (Hierarchical NSW)**: The most advanced! It combines Skip List's layering with NSW's graph structure, creating a hierarchical graph for ultra-fast approximate nearest neighbor search.

## 📚 Step-by-Step Tutorial

### **Part 1: Your First Insertion**

1. **Choose HNSW** (it's the most interesting!)
2. Click **"Insert Node"** 
3. Watch the magic happen:
   - A random point is generated
   - The algorithm assigns it a level (using exponential decay)
   - It finds the best position in the graph
   - Connections are made to nearby nodes

4. **Read the step explanation** at the bottom - it shows:
   - The formula used for level assignment
   - Why each decision was made
   - Distance calculations
   - Layer information

### **Part 2: Building Your Graph**

1. Click **"Insert Node"** 4-5 more times
2. Use the **Play button** to auto-play through steps
3. Try the **Previous/Next** buttons to go step-by-step
4. Use the **slider** to jump to specific steps

### **Part 3: Layer Exploration (HNSW only)**

1. Look at the **layer slider** below the graph
2. Move it to see different layers:
   - **Layer 0**: The base layer (most nodes)
   - **Higher layers**: Fewer nodes, longer connections
3. Toggle **"All Layers"** to see the entire hierarchy at once

### **Part 4: Searching**

1. Make sure you have at least 5 nodes
2. Click **"Search"**
3. A red query point appears
4. Watch as the algorithm:
   - Starts at the entry point (top layer)
   - Greedily moves to closer nodes
   - Descends through layers
   - Finds the nearest neighbor at layer 0

### **Part 5: Compare Algorithms**

1. Click **"Reset"** to clear everything
2. Switch to **"NSW"**
3. Insert 5-6 nodes
4. Do a search
5. Notice the differences:
   - No layers (single graph)
   - Different connection patterns
   - Similar greedy search strategy

6. Try **"Skip List"** next:
   - Linear structure (left to right)
   - Probabilistic levels
   - Different search pattern

## 🎨 Understanding the Visualization

### **Colors Matter!**
- **Red nodes**: Currently being processed
- **Green nodes**: Candidates for connections or search results
- **Orange nodes**: Previously visited
- **Blue/Purple/Pink nodes**: Different levels (higher level = more important)

### **Edges Tell Stories**
- **Thin brown lines**: Normal connections
- **Thick red lines with glow**: Active connections being used
- **Arrows**: Show direction of traversal

### **Step Cards Are Your Teacher**
Each card shows:
```
┌─────────────────────────────────┐
│ 🔢 Step Number                  │
│                                  │
│ What's happening: Description   │
│ Why it matters: Explanation     │
│ Math: Formula (if applicable)   │
│ Decision: Reasoning             │
│                                  │
│ Metadata: Node, Distance, Layer │
└─────────────────────────────────┘
```

## 💡 Pro Tips

### **Tip 1: Slow Down**
Don't rush! Each step has valuable information. Use Previous/Next instead of Play to really understand.

### **Tip 2: Layer Jumping**
In HNSW, jump between layers while at the same step to see how nodes appear/disappear at different levels.

### **Tip 3: Hover for Info**
Hover over nodes to see their level. Hovered nodes show "L#" above them.

### **Tip 4: Watch Statistics**
The stats panel shows:
- Total nodes: How big is your graph?
- Max level: How tall is the hierarchy?

### **Tip 5: Build Incrementally**
Insert nodes one at a time and watch how the structure evolves. This is the best way to learn!

## 🎓 Learning Objectives

### **After using this visualizer, you'll understand:**

✅ How probabilistic level assignment works
✅ Why hierarchical search is faster than linear
✅ The trade-off between connections and efficiency
✅ How greedy search navigates graphs
✅ The difference between NSW and HNSW
✅ When to use each algorithm

## 🧪 Experiment Ideas

### **Experiment 1: Level Distribution**
Insert 10 nodes and observe:
- How many nodes at each level?
- Does it match exponential decay?
- What's the tallest tower you can build?

### **Experiment 2: Search Paths**
Do multiple searches and notice:
- Does it always take the same path?
- How many hops to find the nearest neighbor?
- Which layers are used most?

### **Experiment 3: Algorithm Comparison**
Build identical-sized structures in all 3 algorithms:
- Which has most connections?
- Which search path is shortest?
- Which is easier to understand?

## 🐛 Troubleshooting

### **"Search button doesn't work"**
You need at least one node! Insert some first.

### **"Nodes are overlapping"**
They're randomly placed. Click Reset and try again for better spacing.

### **"I can't see all layers"**
Make sure "All Layers" checkbox is **checked**.

### **"Step playback is too fast"**
Use the Previous/Next buttons for manual control, or click Pause during playback.

## 🌟 Advanced Features

### **Custom Exploration**
- Use the step slider to create "animation loops"
- Compare the same step at different layers
- Screenshot interesting configurations!

### **Teaching Mode**
- Use this in presentations
- Explain each step out loud while visualizing
- Challenge students to predict the next step

## 📖 Further Reading

Want to dive deeper? Look up:
- **Original HNSW paper**: Malkov & Yashunin (2018)
- **NSW foundations**: Navigable small-world networks
- **Skip Lists**: William Pugh (1990)
- **Approximate Nearest Neighbors**: The ANN-Benchmarks

## 🎉 Have Fun!

The best way to learn is by experimenting. Don't be afraid to:
- Click everything
- Break things (use Reset!)
- Build weird structures
- Compare algorithms
- Share what you learn!

---

**Happy Visualizing!** 🚀📊✨

*Remember: Understanding algorithms is like reading a story - each step builds on the last, and the ending is always satisfying!*
