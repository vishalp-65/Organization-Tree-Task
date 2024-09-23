// Color Pool with Human-Readable Names
const colorPool = [
    { name: "Salmon", hex: "#F6AF8E" },
    { name: "Lavender", hex: "#C3A5FF" },
    { name: "Sage", hex: "#B1D0A5" },
    { name: "Canary", hex: "#F6ED8E" },
    { name: "Aqua", hex: "#8EF4F6" },
    { name: "Mint", hex: "#C0F68E" },
    { name: "Rose", hex: "#F68ECB" },
    { name: "Periwinkle", hex: "#8E97F6" },
    { name: "Blush", hex: "#F68EAB" },
    { name: "Amber", hex: "#F6CE8E" },
    { name: "Lime", hex: "#DFF68E" },
];
let currentColorIndex = 0;

export const assignColor = () => {
    const color = colorPool[currentColorIndex];
    currentColorIndex = (currentColorIndex + 1) % colorPool.length; // Round-Robin Logic
    return color.hex;
};
