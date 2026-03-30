# HNSW Algorithm Visualizer 📚✨

An **interactive, beautiful visualizer** for **HNSW** (Hierarchical Navigable Small World), **NSW** (Navigable Small World), and **Skip List** algorithms, built with **Next.js**, **TypeScript**, and **Framer Motion**.

## 🎨 Features

### **Three Algorithm Visualizations**
1. **Skip List** - Probabilistic linked list with multiple levels
2. **NSW** - Navigable Small World graph structure  
3. **HNSW** - Hierarchical Navigable Small World (the most advanced!)

### **🎯 Core Capabilities**

#### **Interactive Insertion**
- Click "Insert Node" to add random points
- Watch step-by-step as the algorithm:
  - Assigns probabilistic levels
  - Navigates through layers
  - Makes connection decisions
  - Shows all distance calculations

#### **Smart Search Visualization**
- Click "Search" to query for nearest neighbors
- See the greedy search navigate through:
  - Multiple hierarchical layers (HNSW)
  - Graph connections (NSW)
  - Skip list levels
- View distance formulas and comparisons

#### **Layer-by-Layer Exploration**
- Toggle between individual layers or view all layers at once
- Slider to navigate through different levels
- Visual indicators for:
  - Current nodes (red)
  - Candidate nodes (green)
  - Visited nodes (orange)
  - Query points (red with dashed circle)

#### **Step-by-Step Playback**
- Play/Pause animation controls
- Previous/Next step buttons
- Slider to jump to any step
- Detailed explanations for each step including:
  - Mathematical formulas
  - Distance calculations
  - Decision rationale
  - Layer information

### **🎨 Beautiful Book/College Paper Theme**
- Vintage paper texture backgrounds
- Warm amber and orange color palette
- Georgia serif fonts for headers
- Elegant shadows and borders
- Smooth animations with Framer Motion
- Custom scrollbar styling

### **📊 Real-time Statistics**
- Total nodes count
- Maximum level reached
- Current layer indicator

### **🔧 Technical Details**

#### **Algorithms Implemented**
- **HNSW**: Full implementation with:
  - Exponential decay level assignment
  - Multi-layer greedy search
  - M/Mmax connection management
  - ef_construction parameter
  
- **NSW**: Complete graph-based implementation
  - Greedy insertion
  - M-nearest neighbor selection
  - Bidirectional connections

- **Skip List**: Classic probabilistic structure
  - Level assignment via coin flip simulation
  - Forward pointer navigation
  - Ordered insertion

#### **Tech Stack**
- **Next.js 15** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **SVG** for graph rendering

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 How to Use

1. **Choose an Algorithm**: Click on Skip List, NSW, or HNSW
2. **Insert Nodes**: Click "Insert Node" to add points to the data structure
3. **Search**: Once you have nodes, click "Search" to find nearest neighbors
4. **Explore Steps**: Use the playback controls to step through the algorithm
5. **Change Layers**: Use the layer slider to explore different levels (HNSW/Skip List)
6. **Toggle Views**: Enable "All Layers" to see the entire structure at once

## 📝 Understanding the Visualizations

### **Node Colors**
- **Blue/Purple/Pink/Orange/Teal**: Different levels (0-4)
- **Red**: Current node being processed
- **Green**: Candidate nodes for connections
- **Orange**: Visited nodes during search

### **Edges**
- **Light brown**: Regular connections
- **Red (glowing)**: Currently highlighted connections
- **Arrows**: Direction of traversal

### **Step Cards**
Each step shows:
- **Description**: What's happening
- **Explanation**: Why it's happening
- **Formula**: Mathematical computation (if applicable)
- **Decision**: Why this choice was made
- **Metadata**: Node ID, distance, layer

## 🌟 Extra Features

- **Responsive Design**: Works on all screen sizes
- **Smooth Animations**: Every transition is animated
- **Hover Effects**: Interactive node highlighting
- **Auto-play**: Watch the algorithm run automatically
- **Reset**: Clear everything and start fresh
- **Real-time Updates**: Graph updates as you navigate steps

## 🎓 Educational Value

Perfect for:
- Learning proximity search algorithms
- Understanding hierarchical data structures
- Visualizing graph algorithms
- Teaching computer science concepts
- Research and presentations

## 📖 Algorithm Details

### **HNSW (Hierarchical Navigable Small World)**
- **Time Complexity**: O(log n) search
- **Space Complexity**: O(n log n)
- **Best For**: Large-scale approximate nearest neighbor search

### **NSW (Navigable Small World)**  
- **Time Complexity**: O(log n) average
- **Space Complexity**: O(n)
- **Best For**: Medium-scale nearest neighbor search

### **Skip List**
- **Time Complexity**: O(log n) average
- **Space Complexity**: O(n)
- **Best For**: Ordered data with fast search

## 🎨 Design Philosophy

The visualizer uses a **book/college paper aesthetic** to create a:
- Professional yet approachable interface
- Vintage academic feel
- Warm, inviting color scheme
- Clear visual hierarchy
- Intuitive controls

## 🔮 Future Enhancements

Potential additions:
- Custom point insertion (click to add)
- Adjustable parameters (M, efConstruction, Ml)
- Algorithm comparison mode
- Performance metrics
- Export/import graph states
- Multiple query visualization
- 3D visualization mode

## 📄 License

MIT License - Feel free to use for educational purposes!

## 🙏 Credits

Built with ❤️ using modern web technologies to make complex algorithms accessible and beautiful.

---

**Enjoy visualizing!** 🚀📊✨

