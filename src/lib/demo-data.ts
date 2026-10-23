// ============================================================================
// GarmentFlow ERP — Realistic Demo Data for Garment Manufacturing
// ============================================================================
import { 
  Buyer, Supplier, Style, Order, Employee, Sample, InventoryItem, 
  FabricRoll, PurchaseOrder, ProductionPlan, CuttingOrder, Bundle,
  QualityInspection, PackingList, Dispatch, JobWorkOrder,
  AttendanceRecord, LeaveRequest, PayrollEntry, Enquiry,
  ApprovalRequest, Notification, AuditLog, Factory, Department,
  Warehouse, ProductionLine, Invoice, PaymentReceipt, LedgerEntry
} from "./types";

// ═══════════════════════════════════════════════
// ORGANIZATION
// ═══════════════════════════════════════════════

export const companyDetails = {
  companyName: "Mrityunjay Enterprises Pvt. Ltd.",
  companyCode: "MEPL",
  registeredAddress: "Palri, Bhilwara, State- Rajasthan",
  city: "Bhilwara",
  state: "Rajasthan",
  gstin: "08AAACD1234F1Z9",
  currency: "INR (₹)",
  email: "contact@mrityunjayenterprises.com",
  phone: "+91-98290-12345",
  website: "www.mrityunjayenterprises.com",
};

export const factories: Factory[] = [
  { id: "f1", companyId: "c1", name: "Mrityunjay Enterprises", code: "MEPL", address: "Palri, Bhilwara, State- Rajasthan", city: "Bhilwara", capacity: 13000, status: "active" },
];

export const departments: Department[] = [
  { id: "d1", factoryId: "f1", name: "Cutting", code: "CUT", type: "production", managerId: "e5", status: "active" },
  { id: "d2", factoryId: "f1", name: "Stitching", code: "STI", type: "production", managerId: "e6", status: "active" },
  { id: "d3", factoryId: "f1", name: "Quality Control", code: "QC", type: "quality", managerId: "e8", status: "active" },
  { id: "d4", factoryId: "f1", name: "Finishing", code: "FIN", type: "production", managerId: "e9", status: "active" },
  { id: "d5", factoryId: "f1", name: "Packing", code: "PAK", type: "production", status: "active" },
  { id: "d6", factoryId: "f1", name: "Store / Warehouse", code: "STR", type: "warehouse", status: "active" },
  { id: "d7", factoryId: "f1", name: "Merchandising", code: "MER", type: "commercial", status: "active" },
  { id: "d8", factoryId: "f1", name: "HR & Admin", code: "HR", type: "admin", status: "active" },
  { id: "d9", factoryId: "f1", name: "Accounts", code: "ACC", type: "finance", status: "active" },
];

export const warehouses: Warehouse[] = [
  { id: "w1", factoryId: "f1", name: "Main Factory Store", code: "STR-MEPL", address: "Palri, Bhilwara, State- Rajasthan", type: "central", status: "active" },
];

export const productionLines: ProductionLine[] = [
  { id: "l1", factoryId: "f1", departmentId: "d2", name: "Line A", code: "L-A", capacity: 600, machineCount: 35, supervisorId: "e12", status: "active" },
  { id: "l2", factoryId: "f1", departmentId: "d2", name: "Line B", code: "L-B", capacity: 550, machineCount: 32, supervisorId: "e13", status: "active" },
  { id: "l3", factoryId: "f1", departmentId: "d2", name: "Line C", code: "L-C", capacity: 500, machineCount: 30, supervisorId: "e14", status: "active" },
  { id: "l4", factoryId: "f1", departmentId: "d2", name: "Line D", code: "L-D", capacity: 700, machineCount: 40, status: "active" },
  { id: "l5", factoryId: "f1", departmentId: "d2", name: "Line E", code: "L-E", capacity: 650, machineCount: 38, status: "active" },
];

// ═══════════════════════════════════════════════
// BUYERS
// ═══════════════════════════════════════════════

export const buyers: Buyer[] = [
  {
    id: "b1", code: "BYR-001", name: "Nordstrom Inc.", companyName: "Nordstrom Inc.",
    category: "export", type: "brand", contactPerson: "Sarah Mitchell",
    email: "sarah.mitchell@nordstrom.com", phone: "+1-206-555-0142", whatsapp: "+1-206-555-0142",
    country: "United States", state: "Washington", city: "Seattle",
    address: "1617 Sixth Avenue, Seattle, WA 98101", currency: "USD",
    paymentTerms: "LC 60 Days", creditLimit: 5000000,
    totalOrders: 24, totalOrderValue: 18500000, outstandingAmount: 2340000,
    rating: 4.8, status: "active", createdAt: "2024-03-15"
  },
  {
    id: "b2", code: "BYR-002", name: "Marks & Spencer", companyName: "Marks & Spencer plc",
    category: "export", type: "brand", contactPerson: "James Thornton",
    email: "james.thornton@marksandspencer.com", phone: "+44-20-7935-4422",
    country: "United Kingdom", state: "London", city: "London",
    address: "Waterside House, 35 North Wharf Road, London W2 1NW", currency: "GBP",
    paymentTerms: "DA 45 Days", creditLimit: 8000000,
    totalOrders: 36, totalOrderValue: 32000000, outstandingAmount: 4200000,
    rating: 4.9, status: "active", createdAt: "2023-11-20"
  },
  {
    id: "b3", code: "BYR-003", name: "Reliance Trends", companyName: "Reliance Retail Ltd.",
    category: "domestic", type: "retail", contactPerson: "Priya Sharma",
    email: "priya.sharma@relianceretail.com", phone: "+91-22-3555-8700",
    country: "India", state: "Maharashtra", city: "Mumbai",
    address: "Maker Chambers IV, 222, Nariman Point, Mumbai 400021", currency: "INR",
    paymentTerms: "Net 30", creditLimit: 20000000,
    totalOrders: 52, totalOrderValue: 45000000, outstandingAmount: 5600000,
    rating: 4.5, status: "active", createdAt: "2024-01-10"
  },
  {
    id: "b4", code: "BYR-004", name: "Zara (Inditex)", companyName: "Industria de Diseño Textil S.A.",
    category: "export", type: "brand", contactPerson: "Carlos Mendoza",
    email: "carlos.mendoza@inditex.com", phone: "+34-981-185-400",
    country: "Spain", state: "A Coruña", city: "Arteixo",
    address: "Avenida de la Diputación, Edificio Inditex, 15143 Arteixo", currency: "EUR",
    paymentTerms: "LC 90 Days", creditLimit: 12000000,
    totalOrders: 18, totalOrderValue: 28000000, outstandingAmount: 7800000,
    rating: 4.7, status: "active", createdAt: "2024-06-05"
  },
  {
    id: "b5", code: "BYR-005", name: "Target Australia", companyName: "Target Australia Pty Ltd",
    category: "export", type: "private-label", contactPerson: "Emma Watson",
    email: "emma.watson@target.com.au", phone: "+61-3-9829-0111",
    country: "Australia", state: "Victoria", city: "Melbourne",
    address: "Level 3, 12-14 Marine Parade, Geelong VIC 3220", currency: "AUD",
    paymentTerms: "TT 30 Days", creditLimit: 4000000,
    totalOrders: 15, totalOrderValue: 12000000, outstandingAmount: 1800000,
    rating: 4.3, status: "active", createdAt: "2024-09-12"
  },
];

// ═══════════════════════════════════════════════
// SUPPLIERS
// ═══════════════════════════════════════════════

export const suppliers: Supplier[] = [
  { id: "s1", code: "SUP-001", name: "Arvind Mills", contactPerson: "Rajesh Patel", categories: ["Denim", "Cotton Fabric", "Twill"], email: "rajesh@arvindmills.com", phone: "+91-79-6819-0000", address: "Naroda Road", city: "Ahmedabad", state: "Gujarat", country: "India", paymentTerms: "Net 45", leadTime: 21, rating: 4.7, totalPurchases: 18500000, outstandingAmount: 3200000, status: "active", createdAt: "2023-08-15" },
  { id: "s2", code: "SUP-002", name: "Vardhman Textiles", contactPerson: "Anil Kumar", categories: ["Yarn", "Cotton Fabric", "Poly-Cotton"], email: "anil@vardhman.com", phone: "+91-161-223-9500", address: "Chandigarh Road", city: "Ludhiana", state: "Punjab", country: "India", paymentTerms: "Net 30", leadTime: 14, rating: 4.5, totalPurchases: 12800000, outstandingAmount: 1900000, status: "active", createdAt: "2023-10-20" },
  { id: "s3", code: "SUP-003", name: "Trident Group", contactPerson: "Sunil Mehta", categories: ["Terry Towel Fabric", "Sheeting", "Yarn"], email: "sunil@tridentgroup.com", phone: "+91-161-502-3000", address: "Sanghera", city: "Barnala", state: "Punjab", country: "India", paymentTerms: "Net 60", leadTime: 28, rating: 4.2, totalPurchases: 8200000, outstandingAmount: 1500000, status: "active", createdAt: "2024-01-05" },
  { id: "s4", code: "SUP-004", name: "YKK India Pvt Ltd", contactPerson: "Takeshi Yamamoto", categories: ["Zipper", "Snap Button", "Hook & Eye"], email: "yamamoto@ykk.co.in", phone: "+91-124-456-7890", address: "IMT Manesar", city: "Gurugram", state: "Haryana", country: "India", paymentTerms: "Net 30", leadTime: 10, rating: 4.9, totalPurchases: 5600000, outstandingAmount: 800000, status: "active", createdAt: "2023-09-01" },
  { id: "s5", code: "SUP-005", name: "Coats India", contactPerson: "David Johnson", categories: ["Thread", "Sewing Thread", "Embroidery Thread"], email: "david.johnson@coats.com", phone: "+91-44-4958-8000", address: "Guindy Industrial Estate", city: "Chennai", state: "Tamil Nadu", country: "India", paymentTerms: "Net 45", leadTime: 7, rating: 4.8, totalPurchases: 3400000, outstandingAmount: 450000, status: "active", createdAt: "2023-07-22" },
  { id: "s6", code: "SUP-006", name: "SML Group", contactPerson: "Vikram Singh", categories: ["Label", "Tag", "Printed Label", "Woven Label"], email: "vikram@sml.com", phone: "+91-120-466-8600", address: "Sector 58", city: "Noida", state: "Uttar Pradesh", country: "India", paymentTerms: "Net 30", leadTime: 12, rating: 4.4, totalPurchases: 2100000, outstandingAmount: 320000, status: "active", createdAt: "2024-02-18" },
  { id: "s7", name: "Ace Button Industries", code: "SUP-007", contactPerson: "Mahesh Agarwal", categories: ["Button", "Rivets", "Eyelets"], email: "mahesh@acebutton.com", phone: "+91-22-2567-8900", address: "Jogeshwari East", city: "Mumbai", state: "Maharashtra", country: "India", paymentTerms: "Net 15", leadTime: 7, rating: 4.1, totalPurchases: 1800000, outstandingAmount: 180000, status: "active", createdAt: "2024-04-10" },
  { id: "s8", code: "SUP-008", name: "Shree Packaging", contactPerson: "Ramesh Gupta", categories: ["Polybag", "Carton", "Tissue Paper", "Hanger"], email: "ramesh@shreepackaging.com", phone: "+91-141-295-0000", address: "Jhotwara Industrial Area", city: "Jaipur", state: "Rajasthan", country: "India", paymentTerms: "Net 15", leadTime: 5, rating: 4.3, totalPurchases: 1200000, outstandingAmount: 150000, status: "active", createdAt: "2024-05-15" },
  { id: "s9", code: "SUP-009", name: "Birla Cellulose", contactPerson: "Ankit Mishra", categories: ["Viscose Fabric", "Modal Fabric", "Lyocell"], email: "ankit@birlacellulose.com", phone: "+91-22-6662-8000", address: "Century Bhavan, Worli", city: "Mumbai", state: "Maharashtra", country: "India", paymentTerms: "Net 30", leadTime: 18, rating: 4.6, totalPurchases: 9500000, outstandingAmount: 2100000, status: "active", createdAt: "2024-03-01" },
  { id: "s10", code: "SUP-010", name: "Freudenberg Interlining", contactPerson: "Hans Mueller", categories: ["Interlining", "Fusible", "Non-Fusible"], email: "hans@freudenberg.com", phone: "+91-22-6140-3000", address: "Thane West", city: "Mumbai", state: "Maharashtra", country: "India", paymentTerms: "Net 45", leadTime: 14, rating: 4.7, totalPurchases: 4300000, outstandingAmount: 680000, status: "active", createdAt: "2023-12-08" },
];

// ═══════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════

export const styles: Style[] = [
  {
    id: "st1", styleNumber: "GF-MCS-2025-001", styleName: "Classic Oxford Button-Down Shirt",
    buyerId: "b1", buyerName: "Nordstrom Inc.", brand: "Nordstrom", season: "AW", year: "2025",
    category: "Shirts", subcategory: "Formal Shirts", gender: "men", garmentType: "Shirt",
    description: "Regular fit oxford cloth button-down shirt with back pleat and barrel cuffs",
    mainImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80",
    attachments: [
      { id: "att-1", name: "Oxford_Shirt_TechPack.pdf", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", size: "2.4 MB", uploadedAt: "2025-01-16" },
      { id: "att-2", name: "Shirt_Flat_Sketch.png", type: "image", url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80", size: "1.1 MB", uploadedAt: "2025-01-16" }
    ],
    fabricType: "Oxford Weave", fabricComposition: "100% Cotton", fabricColor: "White, Light Blue, Pink",
    gsm: 140, smv: 18.5,
    colors: [{ id: "c1", name: "White", code: "WHT", hex: "#FFFFFF" }, { id: "c2", name: "Light Blue", code: "LBL", hex: "#ADD8E6" }, { id: "c3", name: "Pale Pink", code: "PPK", hex: "#FFD1DC" }],
    sizes: ["S", "M", "L", "XL", "XXL"],
    status: "active", createdAt: "2025-01-15"
  },
  {
    id: "st2", styleNumber: "GF-WDR-2025-002", styleName: "Floral Print Maxi Dress",
    buyerId: "b2", buyerName: "Marks & Spencer", brand: "M&S Collection", season: "SS", year: "2025",
    category: "Dresses", subcategory: "Maxi Dress", gender: "women", garmentType: "Dress",
    description: "A-line maxi dress with floral digital print, V-neckline, and adjustable waist tie",
    mainImage: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80",
    attachments: [
      { id: "att-3", name: "MaxiDress_SpecSheet.pdf", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", size: "3.1 MB", uploadedAt: "2025-02-21" },
      { id: "att-4", name: "Print_Artwork.jpg", type: "image", url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80", size: "2.3 MB", uploadedAt: "2025-02-21" }
    ],
    fabricType: "Georgette", fabricComposition: "100% Polyester", fabricColor: "Navy Floral, Rust Floral",
    gsm: 90, smv: 24.0,
    colors: [{ id: "c4", name: "Navy Floral", code: "NVF", hex: "#1B3A5C" }, { id: "c5", name: "Rust Floral", code: "RSF", hex: "#B7410E" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    status: "active", createdAt: "2025-02-20"
  },
  {
    id: "st3", styleNumber: "GF-MDN-2025-003", styleName: "Slim Fit Stretch Denim Jeans",
    buyerId: "b3", buyerName: "Reliance Trends", brand: "Reliance Trends", season: "AW", year: "2025",
    category: "Bottom Wear", subcategory: "Jeans", gender: "men", garmentType: "Jeans",
    description: "5-pocket slim fit denim jeans with stretch, whiskering and 3D crumple effect",
    mainImage: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
    attachments: [
      { id: "att-5", name: "Denim_Wash_Standard_TechPack.pdf", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", size: "4.5 MB", uploadedAt: "2025-03-11" }
    ],
    fabricType: "Denim", fabricComposition: "98% Cotton 2% Elastane", fabricColor: "Dark Indigo, Mid Wash, Black",
    gsm: 340, smv: 22.0,
    colors: [{ id: "c6", name: "Dark Indigo", code: "DIN", hex: "#1A1B41" }, { id: "c7", name: "Mid Wash", code: "MWS", hex: "#4169E1" }, { id: "c8", name: "Jet Black", code: "JBK", hex: "#0A0A0A" }],
    sizes: ["28", "30", "32", "34", "36", "38"],
    status: "active", createdAt: "2025-03-10"
  },
  {
    id: "st4", styleNumber: "GF-KPL-2025-004", styleName: "Kids Printed Polo T-Shirt",
    buyerId: "b5", buyerName: "Target Australia", brand: "Target Kids", season: "SS", year: "2025",
    category: "T-Shirts", subcategory: "Polo", gender: "kids", garmentType: "Polo Shirt",
    description: "Short sleeve polo t-shirt with all-over dinosaur print, rib collar and 3-button placket",
    fabricType: "Single Jersey", fabricComposition: "100% Cotton", fabricColor: "White, Yellow, Green",
    gsm: 160, smv: 12.5,
    colors: [{ id: "c9", name: "White", code: "WHT" }, { id: "c10", name: "Yellow", code: "YLW" }, { id: "c11", name: "Green", code: "GRN" }],
    sizes: ["2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y"],
    status: "active", createdAt: "2025-02-01"
  },
  {
    id: "st5", styleNumber: "GF-WBL-2025-005", styleName: "Women's Ruffle Sleeve Blouse",
    buyerId: "b4", buyerName: "Zara (Inditex)", brand: "Zara", season: "SS", year: "2025",
    category: "Tops", subcategory: "Blouse", gender: "women", garmentType: "Blouse",
    description: "Relaxed fit blouse with ruffle sleeves, mandarin collar, and concealed front buttons",
    fabricType: "Crepe", fabricComposition: "100% Polyester", fabricColor: "Ivory, Black, Dusty Rose",
    gsm: 110, smv: 20.0,
    colors: [{ id: "c12", name: "Ivory", code: "IVR", hex: "#FFFFF0" }, { id: "c13", name: "Black", code: "BLK", hex: "#000000" }, { id: "c14", name: "Dusty Rose", code: "DSR", hex: "#DCAE96" }],
    sizes: ["XS", "S", "M", "L"],
    status: "active", createdAt: "2025-04-05"
  },
  {
    id: "st6", styleNumber: "GF-MCH-2025-006", styleName: "Men's Chino Trousers",
    buyerId: "b1", buyerName: "Nordstrom Inc.", brand: "Nordstrom", season: "AW", year: "2025",
    category: "Bottom Wear", subcategory: "Chinos", gender: "men", garmentType: "Trousers",
    description: "Slim fit chino trousers with side pockets, coin pocket, and back welt pockets",
    fabricType: "Cotton Twill", fabricComposition: "97% Cotton 3% Spandex", fabricColor: "Khaki, Navy, Olive",
    gsm: 230, smv: 20.5,
    colors: [{ id: "c15", name: "Khaki", code: "KHK", hex: "#C3B091" }, { id: "c16", name: "Navy", code: "NVY", hex: "#1B2A4A" }, { id: "c17", name: "Olive", code: "OLV", hex: "#556B2F" }],
    sizes: ["30", "32", "34", "36", "38"],
    status: "active", createdAt: "2025-01-28"
  },
  {
    id: "st7", styleNumber: "GF-WJK-2025-007", styleName: "Women's Quilted Jacket",
    buyerId: "b2", buyerName: "Marks & Spencer", brand: "M&S", season: "AW", year: "2025",
    category: "Outerwear", subcategory: "Jacket", gender: "women", garmentType: "Jacket",
    description: "Lightweight quilted jacket with diamond stitch pattern, zip front, and stand collar",
    fabricType: "Nylon", fabricComposition: "Shell: 100% Nylon, Fill: Recycled Polyester", fabricColor: "Navy, Burgundy",
    gsm: 70, smv: 32.0,
    colors: [{ id: "c18", name: "Navy", code: "NVY" }, { id: "c19", name: "Burgundy", code: "BRG", hex: "#800020" }],
    sizes: ["S", "M", "L", "XL"],
    status: "active", createdAt: "2025-03-20"
  },
  {
    id: "st8", styleNumber: "GF-MSH-2025-008", styleName: "Men's Printed Casual Shirt",
    buyerId: "b3", buyerName: "Reliance Trends", brand: "Reliance Trends", season: "SS", year: "2025",
    category: "Shirts", subcategory: "Casual Shirts", gender: "men", garmentType: "Shirt",
    description: "Regular fit printed casual shirt with spread collar, single pocket, curved hem",
    fabricType: "Poplin", fabricComposition: "100% Cotton", fabricColor: "Blue Check, Green Check",
    gsm: 120, smv: 17.0,
    colors: [{ id: "c20", name: "Blue Check", code: "BLC" }, { id: "c21", name: "Green Check", code: "GRC" }],
    sizes: ["S", "M", "L", "XL", "XXL"],
    status: "active", createdAt: "2025-04-01"
  },
  {
    id: "st9", styleNumber: "GF-KSH-2025-009", styleName: "Kids Denim Shorts",
    buyerId: "b5", buyerName: "Target Australia", brand: "Target Kids", season: "SS", year: "2025",
    category: "Bottom Wear", subcategory: "Shorts", gender: "kids", garmentType: "Shorts",
    description: "5-pocket denim shorts with elastic waistband, drawstring, and turn-up hem",
    fabricType: "Denim", fabricComposition: "100% Cotton", fabricColor: "Light Wash, Medium Wash",
    gsm: 280, smv: 14.0,
    colors: [{ id: "c22", name: "Light Wash", code: "LWS" }, { id: "c23", name: "Medium Wash", code: "MWS" }],
    sizes: ["3Y", "4Y", "5Y", "6Y", "7Y", "8Y", "9Y", "10Y"],
    status: "active", createdAt: "2025-03-05"
  },
  {
    id: "st10", styleNumber: "GF-WTR-2025-010", styleName: "Women's Wide Leg Trousers",
    buyerId: "b4", buyerName: "Zara (Inditex)", brand: "Zara", season: "SS", year: "2025",
    category: "Bottom Wear", subcategory: "Trousers", gender: "women", garmentType: "Trousers",
    description: "High waist wide leg trousers with front pleats, side zip, and pressed crease",
    fabricType: "Linen Blend", fabricComposition: "55% Linen 45% Viscose", fabricColor: "Beige, Black, Terracotta",
    gsm: 180, smv: 19.0,
    colors: [{ id: "c24", name: "Beige", code: "BGE", hex: "#F5F5DC" }, { id: "c25", name: "Black", code: "BLK" }, { id: "c26", name: "Terracotta", code: "TRC", hex: "#E2725B" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    status: "active", createdAt: "2025-04-15"
  },
];

// ═══════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════

export const orders: Order[] = [
  {
    id: "o1", orderNumber: "ORD-2025-0001", buyerPO: "NORD-PO-78234",
    buyerId: "b1", buyerName: "Nordstrom Inc.", brand: "Nordstrom",
    styleId: "st1", styleName: "Classic Oxford Button-Down Shirt", styleNumber: "GF-MCS-2025-001",
    orderDate: "2025-04-01", confirmationDate: "2025-04-05", deliveryDate: "2025-07-15", shipmentDate: "2025-07-10",
    currency: "USD", paymentTerms: "LC 60 Days",
    totalQuantity: 12000, unitPrice: 14.50, totalValue: 174000,
    merchandiserId: "e3", merchandiserName: "Arjun Mehta",
    factoryId: "f1", factoryName: "Mrityunjay Enterprises",
    priority: "high", status: "in-stitching",
    cuttingQty: 12200, stitchingQty: 8400, finishingQty: 5200, packedQty: 3800, dispatchedQty: 0, rejectedQty: 120,
    estimatedCost: 125000, actualCost: 118000, profitMargin: 28.2,
    createdAt: "2025-04-01"
  },
  {
    id: "o2", orderNumber: "ORD-2025-0002", buyerPO: "MS-PO-45678",
    buyerId: "b2", buyerName: "Marks & Spencer", brand: "M&S Collection",
    styleId: "st2", styleName: "Floral Print Maxi Dress", styleNumber: "GF-WDR-2025-002",
    orderDate: "2025-03-20", confirmationDate: "2025-03-25", deliveryDate: "2025-07-30", shipmentDate: "2025-07-25",
    currency: "GBP", paymentTerms: "DA 45 Days",
    totalQuantity: 8000, unitPrice: 22.00, totalValue: 176000,
    merchandiserId: "e4", merchandiserName: "Sneha Kapoor",
    factoryId: "f1", factoryName: "Mrityunjay Enterprises",
    priority: "high", status: "in-cutting",
    cuttingQty: 4200, stitchingQty: 0, finishingQty: 0, packedQty: 0, dispatchedQty: 0, rejectedQty: 0,
    estimatedCost: 128000, actualCost: 0, profitMargin: 27.3,
    createdAt: "2025-03-20"
  },
  {
    id: "o3", orderNumber: "ORD-2025-0003", buyerPO: "RT-PO-99012",
    buyerId: "b3", buyerName: "Reliance Trends", brand: "Reliance Trends",
    styleId: "st3", styleName: "Slim Fit Stretch Denim Jeans", styleNumber: "GF-MDN-2025-003",
    orderDate: "2025-04-10", confirmationDate: "2025-04-12", deliveryDate: "2025-08-05", shipmentDate: "2025-08-01",
    currency: "INR", paymentTerms: "Net 30",
    totalQuantity: 25000, unitPrice: 850, totalValue: 21250000,
    merchandiserId: "e3", merchandiserName: "Arjun Mehta",
    factoryId: "f1", factoryName: "Mrityunjay Enterprises",
    priority: "medium", status: "material-procurement",
    cuttingQty: 0, stitchingQty: 0, finishingQty: 0, packedQty: 0, dispatchedQty: 0, rejectedQty: 0,
    estimatedCost: 15200000, actualCost: 0, profitMargin: 28.5,
    createdAt: "2025-04-10"
  },
  {
    id: "o4", orderNumber: "ORD-2025-0004", buyerPO: "ZARA-PO-33210",
    buyerId: "b4", buyerName: "Zara (Inditex)", brand: "Zara",
    styleId: "st5", styleName: "Women's Ruffle Sleeve Blouse", styleNumber: "GF-WBL-2025-005",
    orderDate: "2025-05-01", confirmationDate: "2025-05-05", deliveryDate: "2025-08-20", shipmentDate: "2025-08-15",
    currency: "EUR", paymentTerms: "LC 90 Days",
    totalQuantity: 15000, unitPrice: 16.00, totalValue: 240000,
    merchandiserId: "e4", merchandiserName: "Sneha Kapoor",
    factoryId: "f1", factoryName: "Mrityunjay Enterprises",
    priority: "high", status: "ready-for-production",
    cuttingQty: 0, stitchingQty: 0, finishingQty: 0, packedQty: 0, dispatchedQty: 0, rejectedQty: 0,
    estimatedCost: 172000, actualCost: 0, profitMargin: 28.3,
    createdAt: "2025-05-01"
  },
  {
    id: "o5", orderNumber: "ORD-2025-0005", buyerPO: "TGT-PO-12456",
    buyerId: "b5", buyerName: "Target Australia", brand: "Target Kids",
    styleId: "st4", styleName: "Kids Printed Polo T-Shirt", styleNumber: "GF-KPL-2025-004",
    orderDate: "2025-03-15", confirmationDate: "2025-03-18", deliveryDate: "2025-06-30", shipmentDate: "2025-06-25",
    currency: "AUD", paymentTerms: "TT 30 Days",
    totalQuantity: 20000, unitPrice: 8.50, totalValue: 170000,
    merchandiserId: "e3", merchandiserName: "Arjun Mehta",
    factoryId: "f1", factoryName: "Mrityunjay Enterprises",
    priority: "urgent", status: "in-packing",
    cuttingQty: 20500, stitchingQty: 20200, finishingQty: 19800, packedQty: 14500, dispatchedQty: 0, rejectedQty: 280,
    estimatedCost: 120000, actualCost: 115000, profitMargin: 29.4,
    createdAt: "2025-03-15"
  },
  {
    id: "o6", orderNumber: "ORD-2025-0006", buyerPO: "NORD-PO-78890",
    buyerId: "b1", buyerName: "Nordstrom Inc.", brand: "Nordstrom",
    styleId: "st6", styleName: "Men's Chino Trousers", styleNumber: "GF-MCH-2025-006",
    orderDate: "2025-04-20", confirmationDate: "2025-04-25", deliveryDate: "2025-08-10", shipmentDate: "2025-08-05",
    currency: "USD", paymentTerms: "LC 60 Days",
    totalQuantity: 10000, unitPrice: 18.00, totalValue: 180000,
    merchandiserId: "e3", merchandiserName: "Arjun Mehta",
    factoryId: "f1", factoryName: "Mrityunjay Enterprises",
    priority: "medium", status: "in-cutting",
    cuttingQty: 3500, stitchingQty: 0, finishingQty: 0, packedQty: 0, dispatchedQty: 0, rejectedQty: 0,
    estimatedCost: 132000, actualCost: 0, profitMargin: 26.7,
    createdAt: "2025-04-20"
  },
  {
    id: "o7", orderNumber: "ORD-2025-0007", buyerPO: "MS-PO-46100",
    buyerId: "b2", buyerName: "Marks & Spencer", brand: "M&S",
    styleId: "st7", styleName: "Women's Quilted Jacket", styleNumber: "GF-WJK-2025-007",
    orderDate: "2025-05-10", confirmationDate: "2025-05-15", deliveryDate: "2025-09-15", shipmentDate: "2025-09-10",
    currency: "GBP", paymentTerms: "DA 45 Days",
    totalQuantity: 5000, unitPrice: 35.00, totalValue: 175000,
    merchandiserId: "e4", merchandiserName: "Sneha Kapoor",
    factoryId: "f1", factoryName: "Mrityunjay Enterprises",
    priority: "medium", status: "material-planning",
    cuttingQty: 0, stitchingQty: 0, finishingQty: 0, packedQty: 0, dispatchedQty: 0, rejectedQty: 0,
    estimatedCost: 128000, actualCost: 0, profitMargin: 26.9,
    createdAt: "2025-05-10"
  },
  {
    id: "o8", orderNumber: "ORD-2025-0008", buyerPO: "RT-PO-99200",
    buyerId: "b3", buyerName: "Reliance Trends", brand: "Reliance Trends",
    styleId: "st8", styleName: "Men's Printed Casual Shirt", styleNumber: "GF-MSH-2025-008",
    orderDate: "2025-05-05", confirmationDate: "2025-05-08", deliveryDate: "2025-08-25", shipmentDate: "2025-08-20",
    currency: "INR", paymentTerms: "Net 30",
    totalQuantity: 18000, unitPrice: 550, totalValue: 9900000,
    merchandiserId: "e3", merchandiserName: "Arjun Mehta",
    factoryId: "f1", factoryName: "Mrityunjay Enterprises",
    priority: "medium", status: "confirmed",
    cuttingQty: 0, stitchingQty: 0, finishingQty: 0, packedQty: 0, dispatchedQty: 0, rejectedQty: 0,
    estimatedCost: 7100000, actualCost: 0, profitMargin: 28.3,
    createdAt: "2025-05-05"
  },
  {
    id: "o9", orderNumber: "ORD-2025-0009", buyerPO: "TGT-PO-12700",
    buyerId: "b5", buyerName: "Target Australia", brand: "Target Kids",
    styleId: "st9", styleName: "Kids Denim Shorts", styleNumber: "GF-KSH-2025-009",
    orderDate: "2025-04-15", confirmationDate: "2025-04-18", deliveryDate: "2025-07-20", shipmentDate: "2025-07-15",
    currency: "AUD", paymentTerms: "TT 30 Days",
    totalQuantity: 15000, unitPrice: 10.00, totalValue: 150000,
    merchandiserId: "e3", merchandiserName: "Arjun Mehta",
    factoryId: "f1", factoryName: "Mrityunjay Enterprises",
    priority: "high", status: "in-finishing",
    cuttingQty: 15300, stitchingQty: 15100, finishingQty: 12800, packedQty: 0, dispatchedQty: 0, rejectedQty: 180,
    estimatedCost: 108000, actualCost: 102000, profitMargin: 28.0,
    createdAt: "2025-04-15"
  },
  {
    id: "o10", orderNumber: "ORD-2025-0010", buyerPO: "ZARA-PO-33500",
    buyerId: "b4", buyerName: "Zara (Inditex)", brand: "Zara",
    styleId: "st10", styleName: "Women's Wide Leg Trousers", styleNumber: "GF-WTR-2025-010",
    orderDate: "2025-05-15", confirmationDate: "2025-05-20", deliveryDate: "2025-09-01", shipmentDate: "2025-08-28",
    currency: "EUR", paymentTerms: "LC 90 Days",
    totalQuantity: 12000, unitPrice: 19.00, totalValue: 228000,
    merchandiserId: "e4", merchandiserName: "Sneha Kapoor",
    factoryId: "f1", factoryName: "Mrityunjay Enterprises",
    priority: "medium", status: "awaiting-approval",
    cuttingQty: 0, stitchingQty: 0, finishingQty: 0, packedQty: 0, dispatchedQty: 0, rejectedQty: 0,
    estimatedCost: 168000, actualCost: 0, profitMargin: 26.3,
    createdAt: "2025-05-15"
  },
];

// ═══════════════════════════════════════════════
// ENQUIRIES
// ═══════════════════════════════════════════════

export const enquiries: Enquiry[] = [
  { id: "eq1", enquiryNumber: "ENQ-2025-0034", buyerId: "b1", buyerName: "Nordstrom Inc.", productCategory: "Shirts", styleReference: "Linen Camp Collar Shirt", description: "Relaxed fit linen camp collar shirt for SS26 collection", quantity: 8000, targetPrice: 16.50, targetDate: "2025-12-15", merchandiserId: "e3", merchandiserName: "Arjun Mehta", probability: 75, status: "costing-submitted", followUpDate: "2025-07-28", notes: "Buyer interested in organic linen options", createdAt: "2025-07-10" },
  { id: "eq2", enquiryNumber: "ENQ-2025-0035", buyerId: "b2", buyerName: "Marks & Spencer", productCategory: "Dresses", styleReference: "Jersey Wrap Dress", description: "Midi wrap dress in jersey fabric, solid colors", quantity: 12000, targetPrice: 18.00, targetDate: "2026-01-20", merchandiserId: "e4", merchandiserName: "Sneha Kapoor", probability: 60, status: "sampling-requested", followUpDate: "2025-08-01", notes: "Proto sample requested in 3 colors", createdAt: "2025-07-15" },
  { id: "eq3", enquiryNumber: "ENQ-2025-0036", buyerId: "b4", buyerName: "Zara (Inditex)", productCategory: "Tops", styleReference: "Embroidered Peasant Top", description: "Loose fit peasant top with ethnic embroidery on yoke", quantity: 20000, targetPrice: 12.00, targetDate: "2026-02-01", merchandiserId: "e4", merchandiserName: "Sneha Kapoor", probability: 40, status: "under-discussion", followUpDate: "2025-07-30", notes: "Need to share embroidery development costing", createdAt: "2025-07-18" },
  { id: "eq4", enquiryNumber: "ENQ-2025-0037", buyerId: "b3", buyerName: "Reliance Trends", productCategory: "T-Shirts", styleReference: "Men's Graphic Tee", description: "Round neck graphic printed t-shirt in combed cotton", quantity: 30000, targetPrice: 320, targetDate: "2025-11-15", merchandiserId: "e3", merchandiserName: "Arjun Mehta", probability: 85, status: "negotiation", followUpDate: "2025-07-26", notes: "Price negotiation at ₹295 vs our ₹340 costing", createdAt: "2025-07-05" },
  { id: "eq5", enquiryNumber: "ENQ-2025-0038", buyerId: "b5", buyerName: "Target Australia", productCategory: "Shorts", styleReference: "Boys Cargo Shorts", description: "Boys cargo shorts with multiple pockets, elastic waist", quantity: 10000, targetPrice: 7.50, targetDate: "2026-01-10", merchandiserId: "e3", merchandiserName: "Arjun Mehta", probability: 55, status: "new", followUpDate: "2025-07-29", notes: "New style development required", createdAt: "2025-07-22" },
];

// ═══════════════════════════════════════════════
// SAMPLES
// ═══════════════════════════════════════════════

export const samples: Sample[] = [
  { id: "sm1", sampleNumber: "SMP-2025-0112", buyerId: "b1", buyerName: "Nordstrom Inc.", styleId: "st1", styleName: "Classic Oxford Button-Down Shirt", type: "pre-production", quantity: 6, requestedDate: "2025-03-10", requiredDate: "2025-03-25", merchandiserId: "e3", merchandiserName: "Arjun Mehta", tailorId: "e15", tailorName: "Ram Kumar", revision: 2, cost: 4500, status: "approved", createdAt: "2025-03-10" },
  { id: "sm2", sampleNumber: "SMP-2025-0128", buyerId: "b2", buyerName: "Marks & Spencer", styleId: "st2", styleName: "Floral Print Maxi Dress", type: "fit", quantity: 3, requestedDate: "2025-04-05", requiredDate: "2025-04-20", merchandiserId: "e4", merchandiserName: "Sneha Kapoor", tailorId: "e15", tailorName: "Ram Kumar", revision: 1, cost: 6200, status: "sent-to-buyer", createdAt: "2025-04-05" },
  { id: "sm3", sampleNumber: "SMP-2025-0135", buyerId: "b4", buyerName: "Zara (Inditex)", styleId: "st5", styleName: "Women's Ruffle Sleeve Blouse", type: "size-set", quantity: 8, requestedDate: "2025-05-15", requiredDate: "2025-06-01", merchandiserId: "e4", merchandiserName: "Sneha Kapoor", revision: 0, cost: 8400, status: "under-development", createdAt: "2025-05-15" },
  { id: "sm4", sampleNumber: "SMP-2025-0140", buyerId: "b3", buyerName: "Reliance Trends", styleId: "st3", styleName: "Slim Fit Stretch Denim Jeans", type: "proto", quantity: 3, requestedDate: "2025-05-20", requiredDate: "2025-06-05", merchandiserId: "e3", merchandiserName: "Arjun Mehta", tailorId: "e15", tailorName: "Ram Kumar", revision: 0, cost: 5800, status: "internal-review", createdAt: "2025-05-20" },
  { id: "sm5", sampleNumber: "SMP-2025-0145", buyerId: "b5", buyerName: "Target Australia", styleId: "st4", styleName: "Kids Printed Polo T-Shirt", type: "production", quantity: 12, requestedDate: "2025-03-01", requiredDate: "2025-03-12", merchandiserId: "e3", merchandiserName: "Arjun Mehta", revision: 3, cost: 3200, status: "approved", createdAt: "2025-03-01" },
];

// ═══════════════════════════════════════════════
// EMPLOYEES (50 employees)
// ═══════════════════════════════════════════════

export const employees: Employee[] = [
  { id: "e1", employeeCode: "GF-001", fullName: "Vikram Rathore", dateOfBirth: "1978-05-15", gender: "male", phone: "+91-98290-12345", email: "vikram.rathore@mrityunjayenterprises.com", address: "C-42, Malviya Nagar, Jaipur", emergencyContact: "+91-98290-54321", joiningDate: "2020-04-01", confirmationDate: "2020-07-01", departmentId: "d7", department: "Management", designation: "Managing Director", factoryId: "f1", factory: "Mrityunjay Enterprises", employmentType: "permanent", shift: "General", grade: "L1", skillCategory: "Management", machineSkills: [], basicSalary: 250000, grossSalary: 380000, bankName: "HDFC Bank", bankAccount: "50100123456789", ifscCode: "HDFC0001234", panNumber: "ABCPR1234A", aadharNumber: "1234-5678-9012", status: "active", createdAt: "2020-04-01" },
  { id: "e2", employeeCode: "GF-002", fullName: "Anita Desai", dateOfBirth: "1982-11-20", gender: "female", phone: "+91-98290-23456", email: "anita.desai@mrityunjayenterprises.com", address: "B-15, Vaishali Nagar, Jaipur", emergencyContact: "+91-98290-65432", joiningDate: "2020-06-15", confirmationDate: "2020-09-15", departmentId: "d7", department: "Management", designation: "Director - Operations", factoryId: "f1", factory: "Mrityunjay Enterprises", employmentType: "permanent", shift: "General", grade: "L1", skillCategory: "Management", machineSkills: [], basicSalary: 220000, grossSalary: 340000, bankName: "ICICI Bank", bankAccount: "60200234567890", ifscCode: "ICIC0002345", panNumber: "DEFPR5678B", aadharNumber: "2345-6789-0123", status: "active", createdAt: "2020-06-15" },
  { id: "e3", employeeCode: "GF-003", fullName: "Arjun Mehta", dateOfBirth: "1990-03-12", gender: "male", phone: "+91-98290-34567", email: "arjun.mehta@mrityunjayenterprises.com", address: "22, Tonk Road, Jaipur", emergencyContact: "+91-98290-76543", joiningDate: "2021-01-10", confirmationDate: "2021-04-10", departmentId: "d7", department: "Merchandising", designation: "Senior Merchandiser", factoryId: "f1", factory: "Mrityunjay Enterprises", employmentType: "permanent", shift: "General", grade: "M1", skillCategory: "Merchandising", machineSkills: [], basicSalary: 55000, grossSalary: 82000, bankName: "SBI", bankAccount: "38200345678901", ifscCode: "SBIN0003456", panNumber: "GHIPR9012C", aadharNumber: "3456-7890-1234", status: "active", createdAt: "2021-01-10" },
  { id: "e4", employeeCode: "GF-004", fullName: "Sneha Kapoor", dateOfBirth: "1992-08-25", gender: "female", phone: "+91-98290-45678", email: "sneha.kapoor@mrityunjayenterprises.com", address: "14, Ajmer Road, Jaipur", emergencyContact: "+91-98290-87654", joiningDate: "2021-06-01", confirmationDate: "2021-09-01", departmentId: "d7", department: "Merchandising", designation: "Merchandiser", factoryId: "f1", factory: "Mrityunjay Enterprises", employmentType: "permanent", shift: "General", grade: "M2", skillCategory: "Merchandising", machineSkills: [], basicSalary: 42000, grossSalary: 62000, bankName: "Kotak Bank", bankAccount: "41500456789012", ifscCode: "KKBK0004567", panNumber: "JKLPR3456D", aadharNumber: "4567-8901-2345", status: "active", createdAt: "2021-06-01" },
  { id: "e5", employeeCode: "GF-005", fullName: "Rajendra Singh", dateOfBirth: "1975-12-08", gender: "male", phone: "+91-98290-56789", email: "rajendra.singh@mrityunjayenterprises.com", address: "A-8, Mansarovar, Jaipur", emergencyContact: "+91-98290-98765", joiningDate: "2019-08-15", confirmationDate: "2019-11-15", departmentId: "d1", department: "Cutting", designation: "Cutting Manager", factoryId: "f1", factory: "Mrityunjay Enterprises", employmentType: "permanent", shift: "General", grade: "S1", skillCategory: "Production", machineSkills: ["Straight Knife", "Band Knife", "Die Cutting", "Laser Cutting"], basicSalary: 48000, grossSalary: 72000, bankName: "PNB", bankAccount: "22300567890123", ifscCode: "PUNB0005678", panNumber: "MNOPR7890E", aadharNumber: "5678-9012-3456", status: "active", createdAt: "2019-08-15" },
  { id: "e6", employeeCode: "GF-006", fullName: "Meera Joshi", dateOfBirth: "1985-06-30", gender: "female", phone: "+91-98290-67890", email: "meera.joshi@mrityunjayenterprises.com", address: "D-22, Pratap Nagar, Jaipur", emergencyContact: "+91-98290-09876", joiningDate: "2020-02-01", confirmationDate: "2020-05-01", departmentId: "d2", department: "Stitching", designation: "Production Manager", factoryId: "f1", factory: "Mrityunjay Enterprises", employmentType: "permanent", shift: "General", grade: "S1", skillCategory: "Production", machineSkills: ["SNLS", "DNLS", "Overlock", "Flatlock", "Bartack", "Buttonhole"], basicSalary: 52000, grossSalary: 78000, bankName: "Axis Bank", bankAccount: "91700678901234", ifscCode: "UTIB0006789", panNumber: "PQRPR1234F", aadharNumber: "6789-0123-4567", status: "active", createdAt: "2020-02-01" },
  { id: "e7", employeeCode: "GF-007", fullName: "Ramesh Choudhary", dateOfBirth: "1988-02-14", gender: "male", phone: "+91-98290-78901", email: "ramesh.choudhary@mrityunjayenterprises.com", address: "55, Jhotwara Road, Jaipur", emergencyContact: "+91-98290-10987", joiningDate: "2021-04-15", confirmationDate: "2021-07-15", departmentId: "d6", department: "Store / Warehouse", designation: "Store Manager", factoryId: "f1", factory: "Mrityunjay Enterprises", employmentType: "permanent", shift: "General", grade: "S2", skillCategory: "Warehouse", machineSkills: [], basicSalary: 38000, grossSalary: 56000, bankName: "BOB", bankAccount: "33400789012345", ifscCode: "BARB0007890", panNumber: "STUPR5678G", aadharNumber: "7890-1234-5678", status: "active", createdAt: "2021-04-15" },
  { id: "e8", employeeCode: "GF-008", fullName: "Kavita Sharma", dateOfBirth: "1987-09-05", gender: "female", phone: "+91-98290-89012", email: "kavita.sharma@mrityunjayenterprises.com", address: "F-7, Shastri Nagar, Jaipur", emergencyContact: "+91-98290-21098", joiningDate: "2020-11-01", confirmationDate: "2021-02-01", departmentId: "d3", department: "Quality Control", designation: "Quality Manager", factoryId: "f1", factory: "Mrityunjay Enterprises", employmentType: "permanent", shift: "General", grade: "S1", skillCategory: "Quality", machineSkills: [], basicSalary: 45000, grossSalary: 68000, bankName: "HDFC Bank", bankAccount: "50100890123456", ifscCode: "HDFC0008901", panNumber: "VWXPR9012H", aadharNumber: "8901-2345-6789", status: "active", createdAt: "2020-11-01" },
  { id: "e9", employeeCode: "GF-009", fullName: "Suresh Verma", dateOfBirth: "1983-04-18", gender: "male", phone: "+91-98290-90123", email: "suresh.verma@mrityunjayenterprises.com", address: "G-12, Jagatpura, Jaipur", emergencyContact: "+91-98290-32109", joiningDate: "2021-07-01", confirmationDate: "2021-10-01", departmentId: "d4", department: "Finishing", designation: "Finishing Manager", factoryId: "f1", factory: "Mrityunjay Enterprises", employmentType: "permanent", shift: "General", grade: "S2", skillCategory: "Production", machineSkills: ["Iron Press", "Steam Iron", "Vacuum Table"], basicSalary: 35000, grossSalary: 52000, bankName: "SBI", bankAccount: "38200901234567", ifscCode: "SBIN0009012", panNumber: "YZAPR3456I", aadharNumber: "9012-3456-7890", status: "active", createdAt: "2021-07-01" },
  { id: "e10", employeeCode: "GF-010", fullName: "Deepak Agarwal", dateOfBirth: "1980-07-22", gender: "male", phone: "+91-98290-01234", email: "deepak.agarwal@mrityunjayenterprises.com", address: "H-25, Raja Park, Jaipur", emergencyContact: "+91-98290-43210", joiningDate: "2020-09-01", confirmationDate: "2020-12-01", departmentId: "d8", department: "HR & Admin", designation: "HR Manager", factoryId: "f1", factory: "Mrityunjay Enterprises", employmentType: "permanent", shift: "General", grade: "S1", skillCategory: "HR", machineSkills: [], basicSalary: 50000, grossSalary: 75000, bankName: "ICICI Bank", bankAccount: "60200012345678", ifscCode: "ICIC0000123", panNumber: "BCDPR7890J", aadharNumber: "0123-4567-8901", status: "active", createdAt: "2020-09-01" },
  { id: "e11", employeeCode: "GF-011", fullName: "Priyanka Tiwari", dateOfBirth: "1991-01-30", gender: "female", phone: "+91-98290-11234", email: "priyanka.tiwari@mrityunjayenterprises.com", address: "K-4, Sanganer, Jaipur", emergencyContact: "+91-98290-54310", joiningDate: "2022-03-01", confirmationDate: "2022-06-01", departmentId: "d9", department: "Accounts", designation: "Accounts Manager", factoryId: "f1", factory: "Mrityunjay Enterprises", employmentType: "permanent", shift: "General", grade: "S2", skillCategory: "Finance", machineSkills: [], basicSalary: 42000, grossSalary: 62000, bankName: "Axis Bank", bankAccount: "91700112345678", ifscCode: "UTIB0001123", panNumber: "EFGPR1234K", aadharNumber: "1123-4567-8901", status: "active", createdAt: "2022-03-01" },
  { id: "e12", employeeCode: "GF-012", fullName: "Mohan Lal Saini", dateOfBirth: "1986-10-12", gender: "male", phone: "+91-98290-12234", email: "mohan.saini@mrityunjayenterprises.com", address: "L-8, Sitapura, Jaipur", emergencyContact: "+91-98290-65410", joiningDate: "2020-03-15", confirmationDate: "2020-06-15", departmentId: "d2", department: "Stitching", designation: "Line Supervisor", factoryId: "f1", factory: "Mrityunjay Enterprises", reportingManagerId: "e6", reportingManager: "Meera Joshi", employmentType: "permanent", shift: "A-Shift", grade: "O1", skillCategory: "Production", machineSkills: ["SNLS", "DNLS", "Overlock", "Flatlock"], basicSalary: 22000, grossSalary: 32000, bankName: "SBI", bankAccount: "38200122345678", ifscCode: "SBIN0001223", panNumber: "HIJPR5678L", aadharNumber: "1223-4567-8901", status: "active", createdAt: "2020-03-15" },
  { id: "e13", employeeCode: "GF-013", fullName: "Sunita Kumari", dateOfBirth: "1989-06-20", gender: "female", phone: "+91-98290-13234", email: "sunita.kumari@mrityunjayenterprises.com", address: "M-14, Sitapura, Jaipur", emergencyContact: "+91-98290-76510", joiningDate: "2020-08-01", confirmationDate: "2020-11-01", departmentId: "d2", department: "Stitching", designation: "Line Supervisor", factoryId: "f1", factory: "Mrityunjay Enterprises", reportingManagerId: "e6", reportingManager: "Meera Joshi", employmentType: "permanent", shift: "A-Shift", grade: "O1", skillCategory: "Production", machineSkills: ["SNLS", "Overlock", "Coverstitch"], basicSalary: 21000, grossSalary: 31000, bankName: "PNB", bankAccount: "22300132345678", ifscCode: "PUNB0001323", panNumber: "KLMPR9012M", aadharNumber: "1323-4567-8901", status: "active", createdAt: "2020-08-01" },
  { id: "e14", employeeCode: "GF-014", fullName: "Bhanwar Lal", dateOfBirth: "1984-03-08", gender: "male", phone: "+91-98290-14234", email: "bhanwar.lal@mrityunjayenterprises.com", address: "N-6, Sanganer, Jaipur", emergencyContact: "+91-98290-87610", joiningDate: "2021-01-15", departmentId: "d2", department: "Stitching", designation: "Line Supervisor", factoryId: "f1", factory: "Mrityunjay Enterprises", reportingManagerId: "e6", reportingManager: "Meera Joshi", employmentType: "permanent", shift: "B-Shift", grade: "O1", skillCategory: "Production", machineSkills: ["SNLS", "DNLS", "Bartack", "Button Sew"], basicSalary: 20000, grossSalary: 30000, bankName: "BOB", bankAccount: "33400142345678", ifscCode: "BARB0001423", panNumber: "NOPPR3456N", aadharNumber: "1423-4567-8901", status: "active", createdAt: "2021-01-15" },
  { id: "e15", employeeCode: "GF-015", fullName: "Ram Kumar", dateOfBirth: "1979-11-25", gender: "male", phone: "+91-98290-15234", email: "ram.kumar@mrityunjayenterprises.com", address: "O-9, RIICO Area, Jaipur", emergencyContact: "+91-98290-98710", joiningDate: "2019-10-01", departmentId: "d7", department: "Merchandising", designation: "Sample Tailor (Master)", factoryId: "f1", factory: "Mrityunjay Enterprises", employmentType: "permanent", shift: "General", grade: "O1", skillCategory: "Sample", machineSkills: ["SNLS", "DNLS", "Overlock", "Flatlock", "Pattern Making"], basicSalary: 28000, grossSalary: 40000, bankName: "SBI", bankAccount: "38200152345678", ifscCode: "SBIN0001523", panNumber: "QRSPR7890O", aadharNumber: "1523-4567-8901", status: "active", createdAt: "2019-10-01" },
];

// Add more employees (operators, helpers) to reach 50
const operatorNames = [
  "Rekha Devi", "Sanjay Kumar", "Pinky Kumari", "Mukesh Meena", "Geeta Bai",
  "Ravi Shankar", "Pooja Yadav", "Dinesh Saini", "Kamla Devi", "Jagdish Prasad",
  "Mamta Kumari", "Gopal Das", "Savitri Devi", "Prem Chand", "Kanta Bai",
  "Hari Om", "Basanti Devi", "Chotu Ram", "Santoshi Kumari", "Lakhan Singh",
  "Radha Devi", "Banwari Lal", "Gulab Kumari", "Shiv Kumar", "Manisha Kumari",
  "Chhagan Lal", "Pushpa Devi", "Nathu Ram", "Saroj Kumari", "Govind Singh",
  "Tulsi Devi", "Mahendra Kumar", "Dropadi Devi", "Babu Lal", "Leela Devi"
];

for (let i = 0; i < operatorNames.length; i++) {
  const idx = i + 16;
  const gender = i % 2 === 0 ? "female" as const : "male" as const;
  const line = i % 5 === 0 ? "l1" : i % 5 === 1 ? "l2" : i % 5 === 2 ? "l3" : i % 5 === 3 ? "l4" : "l5";
  const factory = "f1";
  employees.push({
    id: `e${idx}`, employeeCode: `GF-0${idx.toString().padStart(2, "0")}`,
    fullName: operatorNames[i], dateOfBirth: `${1985 + (i % 10)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
    gender, phone: `+91-98${290 + i}-${String(10000 + idx * 111).slice(0, 5)}`,
    email: `${operatorNames[i].toLowerCase().replace(/\s/g, ".")}@garmentflow.com`,
    address: `Village ${["Sanganer", "Sitapura", "Bagru", "Phulera", "Amer"][i % 5]}, Jaipur`,
    emergencyContact: `+91-98${290 + i}-${String(50000 + idx * 111).slice(0, 5)}`,
    joiningDate: `${2021 + (i % 3)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
    departmentId: "d2", department: "Stitching", designation: i % 5 === 0 ? "Helper" : "Operator",
    factoryId: "f1", factory: "Mrityunjay Enterprises",
    reportingManagerId: line === "l1" ? "e12" : line === "l2" ? "e13" : "e14",
    reportingManager: line === "l1" ? "Mohan Lal Saini" : line === "l2" ? "Sunita Kumari" : "Bhanwar Lal",
    employmentType: i % 8 === 0 ? "daily-wage" as const : i % 6 === 0 ? "piece-rate" as const : "permanent" as const,
    shift: i % 2 === 0 ? "A-Shift" : "B-Shift", grade: i % 5 === 0 ? "H1" : "O2",
    skillCategory: "Production",
    machineSkills: i % 5 === 0 ? ["Helper"] : ["SNLS", i % 3 === 0 ? "Overlock" : i % 3 === 1 ? "Flatlock" : "DNLS"],
    basicSalary: i % 5 === 0 ? 10000 : 14000 + (i % 5) * 1000,
    grossSalary: i % 5 === 0 ? 13500 : 19000 + (i % 5) * 1200,
    bankName: ["SBI", "PNB", "BOB", "HDFC Bank", "Axis Bank"][i % 5],
    bankAccount: `${30000000000 + idx * 1000000}`, ifscCode: `SBIN000${1000 + idx}`,
    panNumber: `${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i + 1) % 26))}${String.fromCharCode(65 + ((i + 2) % 26))}PR${1000 + idx}${String.fromCharCode(65 + (i % 26))}`,
    aadharNumber: `${String(1000 + idx * 11).slice(0, 4)}-${String(5000 + idx * 13).slice(0, 4)}-${String(9000 + idx * 7).slice(0, 4)}`,
    status: "active", createdAt: `${2021 + (i % 3)}-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`
  });
}

// ═══════════════════════════════════════════════
// QUALITY INSPECTIONS
// ═══════════════════════════════════════════════

export const qualityInspections: QualityInspection[] = [
  { id: "qi1", inspectionNumber: "QC-2025-0456", orderId: "o1", orderNumber: "ORD-2025-0001", styleId: "st1", styleName: "Classic Oxford Button-Down Shirt", buyerName: "Nordstrom Inc.", stage: "inline-stitching", inspectorId: "e8", inspectorName: "Kavita Sharma", date: "2025-07-22", inspectedQty: 500, passQty: 468, failQty: 32, reworkQty: 28, rejectedQty: 4, defects: [{ id: "qd1", category: "Stitching", description: "Skip stitch on side seam", severity: "major", location: "Side Seam", quantity: 12, rootCause: "Needle timing off", correctiveAction: "Machine serviced, needle replaced" }, { id: "qd2", category: "Measurement", description: "Chest measurement out of tolerance (+1.5cm)", severity: "major", location: "Chest", quantity: 8, rootCause: "Pattern error on size XL" }, { id: "qd3", category: "Stitching", description: "Broken stitch at collar attachment", severity: "critical", location: "Collar", quantity: 4 }, { id: "qd4", category: "Fabric", description: "Oil stain on front panel", severity: "minor", location: "Front", quantity: 8 }], decision: "conditional-pass", notes: "Line B needs improved quality checks. Side seam machines require servicing.", images: [], status: "completed", createdAt: "2025-07-22" },
  { id: "qi2", inspectionNumber: "QC-2025-0457", orderId: "o5", orderNumber: "ORD-2025-0005", styleId: "st4", styleName: "Kids Printed Polo T-Shirt", buyerName: "Target Australia", stage: "end-line", inspectorId: "e8", inspectorName: "Kavita Sharma", date: "2025-07-23", inspectedQty: 800, passQty: 776, failQty: 24, reworkQty: 20, rejectedQty: 4, defects: [{ id: "qd5", category: "Print", description: "Print misalignment on chest", severity: "major", location: "Chest", quantity: 10 }, { id: "qd6", category: "Stitching", description: "Uneven hemming", severity: "minor", location: "Bottom Hem", quantity: 14 }], decision: "pass", notes: "Good quality overall. Minor hemming issues on a few pieces.", images: [], status: "completed", createdAt: "2025-07-23" },
  { id: "qi3", inspectionNumber: "QC-2025-0458", orderId: "o9", orderNumber: "ORD-2025-0009", styleId: "st9", styleName: "Kids Denim Shorts", buyerName: "Target Australia", stage: "finishing", inspectorId: "e8", inspectorName: "Kavita Sharma", date: "2025-07-24", inspectedQty: 1200, passQty: 1152, failQty: 48, reworkQty: 40, rejectedQty: 8, defects: [{ id: "qd7", category: "Washing", description: "Shade variation between lots", severity: "major", location: "Overall", quantity: 20 }, { id: "qd8", category: "Finishing", description: "Thread not trimmed properly", severity: "minor", location: "Multiple", quantity: 28 }], decision: "conditional-pass", notes: "Shade grouping needed. Lot 3 and Lot 5 showing visible variation.", images: [], status: "completed", createdAt: "2025-07-24" },
];

// ═══════════════════════════════════════════════
// PRODUCTION DATA
// ═══════════════════════════════════════════════

export const productionPlans: ProductionPlan[] = [
  { id: "pp1", planNumber: "PP-2025-0089", orderId: "o1", orderNumber: "ORD-2025-0001", styleId: "st1", styleName: "Classic Oxford Button-Down Shirt", factoryId: "f1", factoryName: "Mrityunjay Enterprises", lineId: "l1", lineName: "Line A", plannedStartDate: "2025-06-15", plannedEndDate: "2025-07-25", plannedQty: 6000, actualQty: 4800, efficiency: 78, status: "in-progress", createdAt: "2025-06-01" },
  { id: "pp2", planNumber: "PP-2025-0090", orderId: "o1", orderNumber: "ORD-2025-0001", styleId: "st1", styleName: "Classic Oxford Button-Down Shirt", factoryId: "f1", factoryName: "Mrityunjay Enterprises", lineId: "l2", lineName: "Line B", plannedStartDate: "2025-06-20", plannedEndDate: "2025-07-30", plannedQty: 6000, actualQty: 3600, efficiency: 72, status: "in-progress", createdAt: "2025-06-01" },
  { id: "pp3", planNumber: "PP-2025-0091", orderId: "o5", orderNumber: "ORD-2025-0005", styleId: "st4", styleName: "Kids Printed Polo T-Shirt", factoryId: "f1", factoryName: "Mrityunjay Enterprises", lineId: "l3", lineName: "Line C", plannedStartDate: "2025-05-20", plannedEndDate: "2025-07-10", plannedQty: 20000, actualQty: 19800, efficiency: 85, status: "completed", createdAt: "2025-05-10" },
  { id: "pp4", planNumber: "PP-2025-0092", orderId: "o2", orderNumber: "ORD-2025-0002", styleId: "st2", styleName: "Floral Print Maxi Dress", factoryId: "f1", factoryName: "Mrityunjay Enterprises", lineId: "l1", lineName: "Line A", plannedStartDate: "2025-07-28", plannedEndDate: "2025-08-25", plannedQty: 8000, actualQty: 0, efficiency: 0, status: "scheduled", createdAt: "2025-07-01" },
  { id: "pp5", planNumber: "PP-2025-0093", orderId: "o9", orderNumber: "ORD-2025-0009", styleId: "st9", styleName: "Kids Denim Shorts", factoryId: "f1", factoryName: "Mrityunjay Enterprises", lineId: "l4", lineName: "Line D", plannedStartDate: "2025-06-01", plannedEndDate: "2025-07-15", plannedQty: 15000, actualQty: 15100, efficiency: 82, status: "completed", createdAt: "2025-05-20" },
];

// ═══════════════════════════════════════════════
// DISPATCH DATA
// ═══════════════════════════════════════════════

export const dispatches: Dispatch[] = [
  { id: "ds1", dispatchNumber: "DSP-2025-0045", buyerId: "b3", buyerName: "Reliance Trends", orderId: "o3prev", orderNumber: "ORD-2025-prev1", shipmentDate: "2025-07-15", dispatchDate: "2025-07-14", destination: "Reliance DC, Bhiwandi, Maharashtra", transporter: "Gati Logistics", vehicleNumber: "RJ-14-GA-5678", lrNumber: "GLR-789456", cartons: 120, quantity: 8000, grossWeight: 2400, netWeight: 2100, invoiceRef: "INV-2025-0089", ewayBill: "EWB-3345678901", status: "delivered", deliveryDate: "2025-07-16", createdAt: "2025-07-14" },
  { id: "ds2", dispatchNumber: "DSP-2025-0046", buyerId: "b1", buyerName: "Nordstrom Inc.", orderId: "o1prev", orderNumber: "ORD-2025-prev2", shipmentDate: "2025-07-18", dispatchDate: "2025-07-17", destination: "Nordstrom DC, Seattle, WA", transporter: "Maersk Line", vehicleNumber: "Container MSKU-7891234", lrNumber: "BL-MSKU-456789", cartons: 200, quantity: 6000, grossWeight: 1800, netWeight: 1500, invoiceRef: "INV-2025-0090", ewayBill: "EWB-4456789012", status: "in-transit", createdAt: "2025-07-17" },
  { id: "ds3", dispatchNumber: "DSP-2025-0047", buyerId: "b5", buyerName: "Target Australia", orderId: "o5prev", orderNumber: "ORD-2024-0156", shipmentDate: "2025-07-10", dispatchDate: "2025-07-09", destination: "Target DC, Melbourne, VIC", transporter: "Hapag-Lloyd", vehicleNumber: "Container HLCU-9012345", lrNumber: "BL-HLCU-123456", cartons: 150, quantity: 10000, grossWeight: 2000, netWeight: 1700, invoiceRef: "INV-2025-0088", ewayBill: "EWB-2234567890", status: "pod-received", deliveryDate: "2025-07-20", createdAt: "2025-07-09" },
];

// ═══════════════════════════════════════════════
// JOB WORK
// ═══════════════════════════════════════════════

export const jobWorkOrders: JobWorkOrder[] = [
  { id: "jw1", jwOrderNumber: "JW-2025-0078", vendorId: "s3", vendorName: "Trident Group", process: "Washing", orderId: "o9", orderNumber: "ORD-2025-0009", styleName: "Kids Denim Shorts", color: "Light Wash", size: "All", issuedQty: 15300, receivedQty: 14900, rejectedQty: 120, shortQty: 280, rate: 25, totalAmount: 382500, expectedDate: "2025-07-05", actualReturnDate: "2025-07-08", materialDetails: "Stitched shorts for enzyme wash + softener", status: "completed", createdAt: "2025-06-25" },
  { id: "jw2", jwOrderNumber: "JW-2025-0079", vendorId: "s3", vendorName: "Trident Group", process: "Embroidery", orderId: "o2", orderNumber: "ORD-2025-0002", styleName: "Floral Print Maxi Dress", color: "Navy Floral", size: "All", issuedQty: 4200, receivedQty: 1800, rejectedQty: 30, shortQty: 2370, rate: 45, totalAmount: 189000, expectedDate: "2025-07-28", materialDetails: "Embroidery on front yoke - 3-color thread work", status: "in-progress", createdAt: "2025-07-10" },
  { id: "jw3", jwOrderNumber: "JW-2025-0080", vendorId: "s3", vendorName: "Trident Group", process: "Printing", orderId: "o5", orderNumber: "ORD-2025-0005", styleName: "Kids Printed Polo T-Shirt", color: "White", size: "All", issuedQty: 6800, receivedQty: 6800, rejectedQty: 45, shortQty: 0, rate: 18, totalAmount: 122400, expectedDate: "2025-06-15", actualReturnDate: "2025-06-14", materialDetails: "All-over dinosaur screen print - 4 colors", status: "closed", createdAt: "2025-06-05" },
];

// ═══════════════════════════════════════════════
// PURCHASE ORDERS
// ═══════════════════════════════════════════════

export const purchaseOrders: PurchaseOrder[] = [
  { id: "po1", poNumber: "PO-2025-0234", supplierId: "s1", supplierName: "Arvind Mills", deliveryLocation: "Main Factory Store - Bhilwara", items: [{ id: "poi1", itemId: "i1", itemName: "Oxford Cotton Fabric - White", quantity: 5000, receivedQty: 5000, unit: "Meters", rate: 185, discount: 0, tax: 5, amount: 971250 }, { id: "poi2", itemId: "i2", itemName: "Oxford Cotton Fabric - Light Blue", quantity: 4000, receivedQty: 3200, unit: "Meters", rate: 190, discount: 0, tax: 5, amount: 798000 }], subtotal: 1710000, tax: 85500, freight: 12000, total: 1807500, deliveryDate: "2025-05-15", paymentTerms: "Net 45", approvalStatus: "approved", deliveryStatus: "partial", receivedQty: 8200, createdAt: "2025-04-20" },
  { id: "po2", poNumber: "PO-2025-0235", supplierId: "s4", supplierName: "YKK India Pvt Ltd", deliveryLocation: "Main Factory Store - Bhilwara", items: [{ id: "poi3", itemId: "i3", itemName: "YKK Invisible Zipper 20cm - Navy", quantity: 8500, receivedQty: 8500, unit: "Pcs", rate: 22, discount: 5, tax: 18, amount: 209627 }], subtotal: 177650, tax: 31977, freight: 3500, total: 213127, deliveryDate: "2025-05-10", paymentTerms: "Net 30", approvalStatus: "approved", deliveryStatus: "complete", receivedQty: 8500, createdAt: "2025-04-18" },
  { id: "po3", poNumber: "PO-2025-0240", supplierId: "s2", supplierName: "Vardhman Textiles", deliveryLocation: "Main Factory Store - Bhilwara", items: [{ id: "poi4", itemId: "i4", itemName: "Stretch Denim 11oz - Dark Indigo", quantity: 12000, receivedQty: 0, unit: "Meters", rate: 320, discount: 0, tax: 5, amount: 4032000 }], subtotal: 3840000, tax: 192000, freight: 18000, total: 4050000, deliveryDate: "2025-07-30", paymentTerms: "Net 30", approvalStatus: "approved", deliveryStatus: "pending", receivedQty: 0, createdAt: "2025-06-25" },
  { id: "po4", poNumber: "PO-2025-0241", supplierId: "s5", supplierName: "Coats India", deliveryLocation: "Main Factory Store - Bhilwara", items: [{ id: "poi5", itemId: "i5", itemName: "Coats Epic 120 - White", quantity: 500, receivedQty: 500, unit: "Cone", rate: 280, discount: 0, tax: 18, amount: 165200 }, { id: "poi6", itemId: "i6", itemName: "Coats Epic 120 - Navy", quantity: 300, receivedQty: 300, unit: "Cone", rate: 280, discount: 0, tax: 18, amount: 99120 }], subtotal: 224000, tax: 40320, freight: 2000, total: 266320, deliveryDate: "2025-05-20", paymentTerms: "Net 45", approvalStatus: "approved", deliveryStatus: "complete", receivedQty: 800, createdAt: "2025-04-25" },
  { id: "po5", poNumber: "PO-2025-0248", supplierId: "s9", supplierName: "Birla Cellulose", deliveryLocation: "Main Factory Store - Bhilwara", items: [{ id: "poi7", itemId: "i7", itemName: "Linen Blend Fabric - Beige", quantity: 6000, receivedQty: 0, unit: "Meters", rate: 350, discount: 0, tax: 5, amount: 2205000 }], subtotal: 2100000, tax: 105000, freight: 15000, total: 2220000, deliveryDate: "2025-08-05", paymentTerms: "Net 30", approvalStatus: "pending", deliveryStatus: "pending", receivedQty: 0, createdAt: "2025-07-15" },
];

// ═══════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════

export const inventoryItems: InventoryItem[] = [
  { id: "inv1", itemCode: "FAB-OXF-WHT", itemName: "Oxford Cotton Fabric - White", category: "Fabric", unit: "Meters", warehouseId: "w1", warehouseName: "Main Factory Store", currentStock: 3200, reservedStock: 2800, availableStock: 400, incomingStock: 0, reorderLevel: 1000, minStock: 500, maxStock: 10000, lastPrice: 185, avgPrice: 182, stockValue: 582400, lastReceiptDate: "2025-06-10", lastIssueDate: "2025-07-22", status: "low-stock" },
  { id: "inv2", itemCode: "FAB-OXF-BLU", itemName: "Oxford Cotton Fabric - Light Blue", category: "Fabric", unit: "Meters", warehouseId: "w1", warehouseName: "Main Factory Store", currentStock: 1800, reservedStock: 1500, availableStock: 300, incomingStock: 800, reorderLevel: 1000, minStock: 500, maxStock: 8000, lastPrice: 190, avgPrice: 188, stockValue: 338400, lastReceiptDate: "2025-07-05", lastIssueDate: "2025-07-20", status: "low-stock" },
  { id: "inv3", itemCode: "FAB-GEO-NVY", itemName: "Georgette Fabric - Navy", category: "Fabric", unit: "Meters", warehouseId: "w1", warehouseName: "Main Factory Store", currentStock: 5500, reservedStock: 4200, availableStock: 1300, incomingStock: 0, reorderLevel: 2000, minStock: 1000, maxStock: 12000, lastPrice: 220, avgPrice: 215, stockValue: 1182500, lastReceiptDate: "2025-06-20", lastIssueDate: "2025-07-18", status: "in-stock" },
  { id: "inv4", itemCode: "ACC-ZIP-NVY", itemName: "YKK Invisible Zipper 20cm - Navy", category: "Accessories", unit: "Pcs", warehouseId: "w1", warehouseName: "Main Factory Store", currentStock: 6200, reservedStock: 4000, availableStock: 2200, incomingStock: 0, reorderLevel: 2000, minStock: 1000, maxStock: 15000, lastPrice: 22, avgPrice: 21.5, stockValue: 133300, lastReceiptDate: "2025-05-15", lastIssueDate: "2025-07-20", status: "in-stock" },
  { id: "inv5", itemCode: "ACC-THR-WHT", itemName: "Coats Epic 120 Thread - White", category: "Accessories", unit: "Cone", warehouseId: "w1", warehouseName: "Main Factory Store", currentStock: 180, reservedStock: 120, availableStock: 60, incomingStock: 0, reorderLevel: 100, minStock: 50, maxStock: 500, lastPrice: 280, avgPrice: 275, stockValue: 49500, lastReceiptDate: "2025-05-25", lastIssueDate: "2025-07-21", status: "low-stock" },
  { id: "inv6", itemCode: "FAB-DEN-IND", itemName: "Stretch Denim 11oz - Dark Indigo", category: "Fabric", unit: "Meters", warehouseId: "w1", warehouseName: "Main Factory Store", currentStock: 0, reservedStock: 0, availableStock: 0, incomingStock: 12000, reorderLevel: 3000, minStock: 1000, maxStock: 20000, lastPrice: 320, avgPrice: 310, stockValue: 0, lastReceiptDate: "2025-04-10", lastIssueDate: "2025-06-28", status: "out-of-stock" },
  { id: "inv7", itemCode: "PKG-PBG-S", itemName: "Polybag - Standard (12x15 inches)", category: "Packing", unit: "Pcs", warehouseId: "w1", warehouseName: "Main Factory Store", currentStock: 45000, reservedStock: 20000, availableStock: 25000, incomingStock: 0, reorderLevel: 10000, minStock: 5000, maxStock: 100000, lastPrice: 1.5, avgPrice: 1.4, stockValue: 63000, lastReceiptDate: "2025-07-01", lastIssueDate: "2025-07-23", status: "in-stock" },
  { id: "inv8", itemCode: "PKG-CTN-L", itemName: "Export Carton - Large (60x40x30cm)", category: "Packing", unit: "Pcs", warehouseId: "w1", warehouseName: "Main Factory Store", currentStock: 350, reservedStock: 200, availableStock: 150, incomingStock: 500, reorderLevel: 200, minStock: 100, maxStock: 2000, lastPrice: 85, avgPrice: 82, stockValue: 28700, lastReceiptDate: "2025-07-10", lastIssueDate: "2025-07-22", status: "in-stock" },
];

// ═══════════════════════════════════════════════
// ATTENDANCE
// ═══════════════════════════════════════════════

export const generateAttendanceData = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const statuses: AttendanceRecord["status"][] = ["present", "present", "present", "present", "present", "present", "late", "half-day", "absent", "leave"];
  
  for (let day = 20; day <= 25; day++) {
    for (let i = 0; i < Math.min(employees.length, 30); i++) {
      const emp = employees[i];
      const statusIdx = (i + day) % statuses.length;
      const status = day % 7 === 0 ? "weekly-off" : statuses[statusIdx];
      const isPresent = ["present", "late", "half-day"].includes(status);
      
      records.push({
        id: `att-${day}-${i}`,
        employeeId: emp.id,
        employeeName: emp.fullName,
        employeeCode: emp.employeeCode,
        date: `2025-07-${day}`,
        shift: emp.shift || "General",
        inTime: isPresent ? `${8 + (status === "late" ? 1 : 0)}:${String(Math.floor(Math.random() * 30)).padStart(2, "0")}` : "",
        outTime: isPresent ? `${status === "half-day" ? 13 : 17}:${String(Math.floor(Math.random() * 30) + 30).padStart(2, "0")}` : "",
        workingHours: isPresent ? (status === "half-day" ? 4.5 : 8.5) : 0,
        overtimeHours: isPresent && statusIdx % 4 === 0 ? 1.5 : 0,
        status,
        lateMinutes: status === "late" ? 15 + Math.floor(Math.random() * 30) : 0,
        earlyExitMinutes: 0,
        remarks: "",
      });
    }
  }
  return records;
};

// ═══════════════════════════════════════════════
// LEAVE REQUESTS
// ═══════════════════════════════════════════════

export const leaveRequests: LeaveRequest[] = [
  { id: "lr1", employeeId: "e16", employeeName: "Rekha Devi", employeeCode: "GF-016", department: "Stitching", leaveType: "Sick Leave", startDate: "2025-07-28", endDate: "2025-07-29", days: 2, halfDay: false, reason: "Fever and body pain. Doctor's prescription attached.", approverName: "Mohan Lal Saini", status: "pending", appliedDate: "2025-07-25" },
  { id: "lr2", employeeId: "e4", employeeName: "Sneha Kapoor", employeeCode: "GF-004", department: "Merchandising", leaveType: "Earned Leave", startDate: "2025-08-04", endDate: "2025-08-08", days: 5, halfDay: false, reason: "Family function - brother's wedding in Udaipur", approverName: "Vikram Rathore", status: "approved", appliedDate: "2025-07-20", approvedDate: "2025-07-21" },
  { id: "lr3", employeeId: "e12", employeeName: "Mohan Lal Saini", employeeCode: "GF-012", department: "Stitching", leaveType: "Casual Leave", startDate: "2025-07-30", endDate: "2025-07-30", days: 1, halfDay: true, reason: "Need to visit bank for loan documentation", approverName: "Meera Joshi", status: "pending", appliedDate: "2025-07-24" },
  { id: "lr4", employeeId: "e7", employeeName: "Ramesh Choudhary", employeeCode: "GF-007", department: "Store / Warehouse", leaveType: "Casual Leave", startDate: "2025-07-21", endDate: "2025-07-21", days: 1, halfDay: false, reason: "Personal work", approverName: "Vikram Rathore", status: "approved", appliedDate: "2025-07-18", approvedDate: "2025-07-19" },
  { id: "lr5", employeeId: "e20", employeeName: "Mukesh Meena", employeeCode: "GF-020", department: "Stitching", leaveType: "Sick Leave", startDate: "2025-07-22", endDate: "2025-07-23", days: 2, halfDay: false, reason: "Food poisoning", approverName: "Sunita Kumari", status: "approved", appliedDate: "2025-07-22", approvedDate: "2025-07-22" },
];

// ═══════════════════════════════════════════════
// PAYROLL
// ═══════════════════════════════════════════════

export const payrollEntries: PayrollEntry[] = employees.slice(0, 20).map((emp, i) => ({
  id: `pay-${emp.id}`,
  employeeId: emp.id,
  employeeName: emp.fullName,
  employeeCode: emp.employeeCode,
  department: emp.department,
  month: "June",
  year: 2025,
  workingDays: 26,
  presentDays: 24 - (i % 3),
  leaveDays: i % 3,
  overtimeHours: i % 4 === 0 ? 12 : i % 3 === 0 ? 8 : 0,
  basicSalary: emp.basicSalary,
  hra: Math.round(emp.basicSalary * 0.4),
  conveyance: 1600,
  otherAllowances: Math.round(emp.basicSalary * 0.1),
  incentives: i % 2 === 0 ? Math.round(emp.basicSalary * 0.05) : 0,
  overtimePay: i % 4 === 0 ? Math.round(12 * emp.basicSalary / 26 / 8 * 2) : i % 3 === 0 ? Math.round(8 * emp.basicSalary / 26 / 8 * 2) : 0,
  bonus: 0,
  grossPay: emp.grossSalary,
  pfDeduction: Math.round(emp.basicSalary * 0.12),
  esiDeduction: emp.grossSalary <= 21000 ? Math.round(emp.grossSalary * 0.0075) : 0,
  taxDeduction: emp.grossSalary > 50000 ? Math.round(emp.grossSalary * 0.1) : 0,
  loanDeduction: i % 5 === 0 ? 2000 : 0,
  advanceDeduction: i % 7 === 0 ? 1500 : 0,
  otherDeductions: 0,
  totalDeductions: 0,
  netPay: 0,
  status: i < 5 ? "locked" : i < 10 ? "approved" : "calculated",
}));

payrollEntries.forEach(entry => {
  entry.totalDeductions = entry.pfDeduction + entry.esiDeduction + entry.taxDeduction + entry.loanDeduction + entry.advanceDeduction;
  entry.netPay = entry.grossPay - entry.totalDeductions;
});

// ═══════════════════════════════════════════════
// APPROVALS
// ═══════════════════════════════════════════════

export const approvalRequests: ApprovalRequest[] = [
  { id: "apr1", type: "Purchase Order", referenceType: "purchase-order", referenceId: "po5", referenceNumber: "PO-2025-0248", description: "Linen Blend Fabric purchase from Birla Cellulose - ₹22,20,000", requestedBy: "e7", requestedByName: "Ramesh Choudhary", amount: 2220000, currentLevel: 1, totalLevels: 2, status: "pending", actions: [], createdAt: "2025-07-15" },
  { id: "apr2", type: "Order Confirmation", referenceType: "order", referenceId: "o10", referenceNumber: "ORD-2025-0010", description: "Zara - Women's Wide Leg Trousers - 12,000 pcs - €228,000", requestedBy: "e4", requestedByName: "Sneha Kapoor", amount: 228000, currentLevel: 1, totalLevels: 2, status: "pending", actions: [], createdAt: "2025-05-15" },
  { id: "apr3", type: "Leave Request", referenceType: "leave", referenceId: "lr1", referenceNumber: "LR-2025-0234", description: "Rekha Devi - Sick Leave - 2 days (28-29 Jul)", requestedBy: "e16", requestedByName: "Rekha Devi", currentLevel: 1, totalLevels: 1, status: "pending", actions: [], createdAt: "2025-07-25" },
  { id: "apr4", type: "Material Issue", referenceType: "inventory", referenceId: "mi1", referenceNumber: "MI-2025-0567", description: "Fabric issue to cutting - Oxford White - 1200m for ORD-2025-0001", requestedBy: "e5", requestedByName: "Rajendra Singh", currentLevel: 1, totalLevels: 1, status: "pending", actions: [], createdAt: "2025-07-24" },
  { id: "apr5", type: "Overtime Approval", referenceType: "attendance", referenceId: "ot1", referenceNumber: "OT-2025-0089", description: "Line A & B overtime - 2 hours - 15 operators for ORD-2025-0001 urgent", requestedBy: "e6", requestedByName: "Meera Joshi", currentLevel: 1, totalLevels: 1, status: "pending", actions: [], createdAt: "2025-07-25" },
  { id: "apr6", type: "Purchase Requisition", referenceType: "purchase-requisition", referenceId: "pr1", referenceNumber: "PR-2025-0189", description: "Interlining fabric - 3000m for M&S Quilted Jacket order", requestedBy: "e3", requestedByName: "Arjun Mehta", amount: 450000, currentLevel: 1, totalLevels: 2, status: "pending", actions: [], createdAt: "2025-07-23" },
];

// ═══════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════

export const notifications: Notification[] = [
  { id: "n1", type: "order", title: "Production Target Missed", message: "Line B missed daily target by 15% for ORD-2025-0001. Current efficiency: 72%.", priority: "high", read: false, createdAt: "2025-07-25T09:30:00" },
  { id: "n2", type: "inventory", title: "Low Stock Alert", message: "Oxford Cotton Fabric (White) available stock is 400m against reorder level of 1000m. Immediate procurement required.", priority: "urgent", read: false, createdAt: "2025-07-25T08:15:00" },
  { id: "n3", type: "quality", title: "Quality Failure - Inline", message: "QC-2025-0456: Rejection rate 6.4% on ORD-2025-0001 (Limit: 3%). Side seam skip stitch defect on Line B.", priority: "high", read: false, createdAt: "2025-07-24T16:45:00" },
  { id: "n4", type: "delivery", title: "Shipment Delivery Confirmed", message: "DSP-2025-0045 delivered to Reliance DC, Bhiwandi. POD received. 8,000 pcs confirmed.", priority: "low", read: true, createdAt: "2025-07-24T14:20:00" },
  { id: "n5", type: "approval", title: "PO Approval Required", message: "PO-2025-0248 for Birla Cellulose (₹22.2L) awaiting your approval. Required by 30 Jul.", priority: "medium", read: false, createdAt: "2025-07-24T11:00:00" },
  { id: "n6", type: "job-work", title: "Job Work Return Overdue", message: "JW-2025-0079 embroidery from Trident Group is 3 days from due date. 2,370 pcs still pending.", priority: "medium", read: false, createdAt: "2025-07-25T07:00:00" },
  { id: "n7", type: "sample", title: "Sample Sent to Buyer", message: "SMP-2025-0128 (Fit Sample) for M&S Floral Maxi Dress sent via DHL. Tracking: DHL-789456123.", priority: "low", read: true, createdAt: "2025-07-23T10:30:00" },
  { id: "n8", type: "dispatch", title: "Dispatch Due Tomorrow", message: "ORD-2025-0005 (Target Kids Polo) packing completion at 72.5%. Dispatch planned for 27 Jul. Risk of delay.", priority: "high", read: false, createdAt: "2025-07-25T10:00:00" },
  { id: "n9", type: "hr", title: "New Leave Request", message: "Rekha Devi (GF-016, Stitching) applied for 2 days sick leave (28-29 Jul). Pending your approval.", priority: "medium", read: false, createdAt: "2025-07-25T08:45:00" },
  { id: "n10", type: "procurement", title: "Supplier Delivery Delayed", message: "PO-2025-0240: Stretch Denim from Vardhman Textiles delayed. New ETA: 05 Aug (was 30 Jul). ORD-2025-0003 impact.", priority: "high", read: false, createdAt: "2025-07-25T09:00:00" },
];

// ═══════════════════════════════════════════════
// DASHBOARD KPIs
// ═══════════════════════════════════════════════

export const dashboardData = {
  kpis: {
    totalOrders: 10,
    ordersInProduction: 4,
    ordersAwaitingMaterial: 2,
    ordersDelayed: 1,
    ordersDueThisWeek: 2,
    readyForDispatch: 1,
    totalOrderValue: 153250000,
    estimatedRevenue: 153250000,
    estimatedCost: 110340000,
    estimatedMargin: 28.0,
    actualProductionToday: 3420,
    plannedProductionToday: 4100,
    productionEfficiency: 78.5,
    rejectionPercent: 2.8,
    reworkPercent: 4.2,
    workerAttendance: 89.2,
    materialShortages: 3,
    pendingApprovals: 6,
    pendingPOs: 2,
    pendingJobWork: 1,
    finishedGoodsReady: 14500,
    dispatchesDueToday: 0,
  },
  dailyProduction: [
    { date: "Jul 19", planned: 4200, actual: 3950, efficiency: 94 },
    { date: "Jul 20", planned: 0, actual: 0, efficiency: 0 },
    { date: "Jul 21", planned: 4100, actual: 3800, efficiency: 93 },
    { date: "Jul 22", planned: 4100, actual: 3680, efficiency: 90 },
    { date: "Jul 23", planned: 4100, actual: 3520, efficiency: 86 },
    { date: "Jul 24", planned: 4100, actual: 3380, efficiency: 82 },
    { date: "Jul 25", planned: 4100, actual: 3420, efficiency: 83 },
  ],
  orderStatusDistribution: [
    { name: "Confirmed", value: 1, color: "#059669" },
    { name: "Material Stage", value: 3, color: "#d97706" },
    { name: "In Cutting", value: 2, color: "#3b82f6" },
    { name: "In Stitching", value: 1, color: "#6366f1" },
    { name: "In Finishing", value: 1, color: "#8b5cf6" },
    { name: "In Packing", value: 1, color: "#a855f7" },
    { name: "Awaiting Approval", value: 1, color: "#94a3b8" },
  ],
  lineEfficiency: [
    { name: "Line A", efficiency: 78, target: 85, output: 2400, operators: 35 },
    { name: "Line B", efficiency: 72, target: 85, output: 2100, operators: 32 },
    { name: "Line C", efficiency: 85, target: 85, output: 2800, operators: 30 },
    { name: "Line D", efficiency: 82, target: 80, output: 3200, operators: 40 },
    { name: "Line E", efficiency: 79, target: 80, output: 2900, operators: 38 },
  ],
  buyerWiseOrders: [
    { buyer: "Nordstrom", orders: 2, value: 354000, currency: "USD" },
    { buyer: "M&S", orders: 2, value: 351000, currency: "GBP" },
    { buyer: "Reliance", orders: 2, value: 31150000, currency: "INR" },
    { buyer: "Zara", orders: 2, value: 468000, currency: "EUR" },
    { buyer: "Target AU", orders: 2, value: 320000, currency: "AUD" },
  ],
  qualityTrend: [
    { date: "Jul 19", passRate: 96.5, reworkRate: 2.8, rejectRate: 0.7 },
    { date: "Jul 20", passRate: 0, reworkRate: 0, rejectRate: 0 },
    { date: "Jul 21", passRate: 97.2, reworkRate: 2.2, rejectRate: 0.6 },
    { date: "Jul 22", passRate: 95.8, reworkRate: 3.4, rejectRate: 0.8 },
    { date: "Jul 23", passRate: 97.0, reworkRate: 2.5, rejectRate: 0.5 },
    { date: "Jul 24", passRate: 96.0, reworkRate: 3.3, rejectRate: 0.7 },
    { date: "Jul 25", passRate: 96.2, reworkRate: 3.0, rejectRate: 0.8 },
  ],
  attendanceTrend: [
    { date: "Jul 19", present: 92, absent: 4, leave: 3, late: 1 },
    { date: "Jul 21", present: 88, absent: 5, leave: 4, late: 3 },
    { date: "Jul 22", present: 90, absent: 4, leave: 4, late: 2 },
    { date: "Jul 23", present: 89, absent: 5, leave: 3, late: 3 },
    { date: "Jul 24", present: 91, absent: 3, leave: 4, late: 2 },
    { date: "Jul 25", present: 89, absent: 4, leave: 5, late: 2 },
  ],
  recentActivity: [
    { time: "10:15 AM", user: "Kavita Sharma", action: "Completed inline QC inspection", detail: "QC-2025-0456 for ORD-2025-0001", type: "quality" },
    { time: "09:45 AM", user: "Rajendra Singh", action: "Issued fabric to cutting", detail: "1200m Oxford White for ORD-2025-0001", type: "inventory" },
    { time: "09:30 AM", user: "Meera Joshi", action: "Submitted overtime request", detail: "15 operators, 2hrs for Line A & B", type: "hr" },
    { time: "09:00 AM", user: "System", action: "Material shortage alert generated", detail: "3 items below reorder level", type: "alert" },
    { time: "08:45 AM", user: "Rekha Devi", action: "Applied for sick leave", detail: "2 days (28-29 Jul)", type: "hr" },
    { time: "08:30 AM", user: "Arjun Mehta", action: "Updated order status", detail: "ORD-2025-0001 tracking updated", type: "order" },
    { time: "08:15 AM", user: "System", action: "Attendance synced", detail: "Biometric data imported for 25 Jul", type: "system" },
    { time: "Yesterday", user: "Sneha Kapoor", action: "Sent sample to buyer", detail: "SMP-2025-0128 via DHL to M&S London", type: "sample" },
  ],
  criticalAlerts: [
    { severity: "critical", message: "Stretch Denim delivery delayed by Vardhman. ORD-2025-0003 (25,000 pcs) at risk.", module: "procurement" },
    { severity: "high", message: "Line B efficiency dropped to 72%. Below 85% target for 3 consecutive days.", module: "production" },
    { severity: "high", message: "Oxford White fabric stock at 400m. Need 1200m for tomorrow's cutting.", module: "inventory" },
    { severity: "medium", message: "ORD-2025-0005 packing 72.5% complete. Dispatch due 27 Jul.", module: "dispatch" },
    { severity: "medium", message: "6 approval requests pending for more than 24 hours.", module: "approvals" },
  ],
};

// ═══════════════════════════════════════════════
// INVOICES & BILLING
// ═══════════════════════════════════════════════

export const invoices: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2025-0089",
    invoiceType: "commercial-export",
    buyerId: "b1",
    buyerName: "Nordstrom Inc.",
    buyerGstin: "US-TAX-98765432",
    orderId: "o1",
    orderNumber: "ORD-2025-0001",
    dispatchId: "d1",
    dispatchNumber: "DSP-2025-0045",
    invoiceDate: "2025-07-15",
    dueDate: "2025-09-13",
    currency: "USD",
    hsnCode: "6205.20",
    paymentTerms: "LC 60 Days",
    items: [
      { id: "ii-1", description: "Men's Oxford Button-Down Shirt (White)", hsnCode: "6205.20", quantity: 5000, unit: "pcs", unitPrice: 14.50, discount: 0, taxableAmount: 72500, taxRate: 0, total: 72500 },
      { id: "ii-2", description: "Men's Oxford Button-Down Shirt (Blue)", hsnCode: "6205.20", quantity: 3000, unit: "pcs", unitPrice: 14.50, discount: 0, taxableAmount: 43500, taxRate: 0, total: 43500 },
    ],
    subtotal: 116000,
    taxRate: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    totalTax: 0,
    totalAmount: 116000,
    amountPaid: 0,
    balanceDue: 116000,
    bankName: "Mrityunjay Demo Bank",
    bankAccount: "123456789012",
    bankIfsc: "CDEV0001234",
    bankSwift: "CDEVINBB",
    status: "sent",
    createdBy: "Priyanka Tiwari (Accounts)",
    notes: "Export under LUT without payment of IGST. LUT Ref: AD080724001234E.",
    createdAt: "2025-07-15"
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2025-0090",
    invoiceType: "tax-invoice",
    buyerId: "b3",
    buyerName: "Reliance Trends",
    buyerGstin: "27AAACR3456F1Z5",
    orderId: "o3",
    orderNumber: "ORD-2025-0003",
    invoiceDate: "2025-07-18",
    dueDate: "2025-08-17",
    currency: "INR",
    hsnCode: "6203.42",
    paymentTerms: "Net 30",
    items: [
      { id: "ii-3", description: "Men's Slim Fit Denim Jeans - Dark Wash", hsnCode: "6203.42", quantity: 10000, unit: "pcs", unitPrice: 850, discount: 5, taxableAmount: 8075000, taxRate: 5, total: 8478750 },
    ],
    subtotal: 8075000,
    taxRate: 5,
    cgstAmount: 201875,
    sgstAmount: 201875,
    igstAmount: 0,
    totalTax: 403750,
    totalAmount: 8478750,
    amountPaid: 8478750,
    balanceDue: 0,
    bankName: "Mrityunjay Demo Bank",
    bankAccount: "123456789012",
    bankIfsc: "CDEV0001234",
    status: "paid",
    createdBy: "Priyanka Tiwari (Accounts)",
    notes: "GST 5% applicable for apparel value > ₹1000.",
    createdAt: "2025-07-18"
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2025-0091",
    invoiceType: "commercial-export",
    buyerId: "b2",
    buyerName: "Marks & Spencer",
    buyerGstin: "GB-VAT-123456789",
    orderId: "o2",
    orderNumber: "ORD-2025-0002",
    invoiceDate: "2025-07-20",
    dueDate: "2025-09-03",
    currency: "GBP",
    hsnCode: "6204.42",
    paymentTerms: "DA 45 Days",
    items: [
      { id: "ii-4", description: "Women's Floral Print Cotton Maxi Dress", hsnCode: "6204.42", quantity: 4000, unit: "pcs", unitPrice: 22.00, discount: 0, taxableAmount: 88000, taxRate: 0, total: 88000 },
    ],
    subtotal: 88000,
    taxRate: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    totalTax: 0,
    totalAmount: 88000,
    amountPaid: 30000,
    balanceDue: 58000,
    bankName: "Mrityunjay Demo Bank",
    bankAccount: "123456789012",
    bankIfsc: "CDEV0001234",
    bankSwift: "CDEVINBB",
    status: "partial",
    createdBy: "Priyanka Tiwari (Accounts)",
    notes: "Partial payment of GBP 30,000 received via Swift wire transfer.",
    createdAt: "2025-07-20"
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-2025-0092",
    invoiceType: "tax-invoice",
    buyerId: "b5",
    buyerName: "Target Australia",
    buyerGstin: "AU-ABN-456789012",
    orderId: "o5",
    orderNumber: "ORD-2025-0005",
    invoiceDate: "2025-07-22",
    dueDate: "2025-08-21",
    currency: "AUD",
    hsnCode: "6205.30",
    paymentTerms: "TT 30 Days",
    items: [
      { id: "ii-5", description: "Kids' Printed Cotton Polo T-Shirt", hsnCode: "6205.30", quantity: 14500, unit: "pcs", unitPrice: 8.50, discount: 0, taxableAmount: 123250, taxRate: 0, total: 123250 },
    ],
    subtotal: 123250,
    taxRate: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    totalTax: 0,
    totalAmount: 123250,
    amountPaid: 0,
    balanceDue: 123250,
    bankName: "Mrityunjay Demo Bank",
    bankAccount: "123456789012",
    bankIfsc: "CDEV0001234",
    bankSwift: "CDEVINBB",
    status: "sent",
    createdBy: "Arun Kapoor (MD)",
    notes: "Shipped against BL #MSK-2025-998811.",
    createdAt: "2025-07-22"
  },
  {
    id: "inv-5",
    invoiceNumber: "INV-2025-0093",
    invoiceType: "proforma",
    buyerId: "b4",
    buyerName: "Zara (Inditex)",
    buyerGstin: "ES-NIF-A15143000",
    orderId: "o4",
    orderNumber: "ORD-2025-0004",
    invoiceDate: "2025-07-24",
    dueDate: "2025-08-24",
    currency: "EUR",
    hsnCode: "6206.30",
    paymentTerms: "LC 90 Days",
    items: [
      { id: "ii-6", description: "Women's Ruffle Sleeve Cotton Blouse", hsnCode: "6206.30", quantity: 15000, unit: "pcs", unitPrice: 16.00, discount: 0, taxableAmount: 240000, taxRate: 0, total: 240000 },
    ],
    subtotal: 240000,
    taxRate: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    totalTax: 0,
    totalAmount: 240000,
    amountPaid: 0,
    balanceDue: 240000,
    bankName: "Mrityunjay Demo Bank",
    bankAccount: "123456789012",
    bankIfsc: "CDEV0001234",
    bankSwift: "CDEVINBB",
    status: "draft",
    createdBy: "Priyanka Tiwari (Accounts)",
    notes: "Draft proforma invoice for opening Letter of Credit (LC).",
    createdAt: "2025-07-24"
  }
];

export const paymentReceipts: PaymentReceipt[] = [
  {
    id: "pr-1",
    receiptNumber: "REC-2025-0045",
    invoiceId: "inv-2",
    invoiceNumber: "INV-2025-0090",
    buyerId: "b3",
    buyerName: "Reliance Trends",
    paymentDate: "2025-07-20",
    paymentMode: "bank-transfer",
    referenceNumber: "RTGS-NEFT-99887766",
    amount: 8478750,
    currency: "INR",
    remarks: "Full payment received for INV-2025-0090 against ORD-2025-0003.",
    receivedBy: "Priyanka Tiwari (Accounts)"
  },
  {
    id: "pr-2",
    receiptNumber: "REC-2025-0046",
    invoiceId: "inv-3",
    invoiceNumber: "INV-2025-0091",
    buyerId: "b2",
    buyerName: "Marks & Spencer",
    paymentDate: "2025-07-22",
    paymentMode: "wire-tt",
    referenceNumber: "SWIFT-MS-771122",
    amount: 30000,
    currency: "GBP",
    remarks: "Advance/partial payment for shipment INV-2025-0091.",
    receivedBy: "Priyanka Tiwari (Accounts)"
  }
];

// ═══════════════════════════════════════════════
// FINANCIAL ACCOUNTS LEDGER ENTRIES
// ═══════════════════════════════════════════════

export const ledgerEntries: LedgerEntry[] = [
  {
    id: "led-1",
    entryDate: "2025-07-15",
    voucherNumber: "INV-2025-0089",
    voucherType: "Sales Invoice",
    accountCategory: "debtor",
    partyId: "b1",
    partyName: "Nordstrom Inc.",
    contraAccount: "Export Sales A/c",
    particulars: "Export Commercial Invoice for 8,000 pcs Men's Oxford Shirts (ORD-2025-0001) under LUT",
    referenceNumber: "ORD-2025-0001",
    debit: 9628000,
    credit: 0,
    runningBalance: 9628000,
    balanceType: "Dr",
    currency: "INR",
    reconciled: true,
    status: "verified",
    tags: ["Export Sales", "Nordstrom", "LUT"],
    createdBy: "Priyanka Tiwari (Accounts)"
  },
  {
    id: "led-2",
    entryDate: "2025-07-16",
    voucherNumber: "INV-2025-0090",
    voucherType: "Sales Invoice",
    accountCategory: "debtor",
    partyId: "b3",
    partyName: "Reliance Trends",
    contraAccount: "Domestic Sales A/c",
    particulars: "Domestic Tax Invoice for 15,000 pcs Polo T-Shirts (ORD-2025-0003) with 5% GST",
    referenceNumber: "ORD-2025-0003",
    debit: 8478750,
    credit: 0,
    runningBalance: 18106750,
    balanceType: "Dr",
    currency: "INR",
    reconciled: true,
    status: "verified",
    tags: ["Domestic", "GST Tax Invoice"],
    createdBy: "Priyanka Tiwari (Accounts)"
  },
  {
    id: "led-3",
    entryDate: "2025-07-18",
    voucherNumber: "PUR-2025-0234",
    voucherType: "Purchase Bill",
    accountCategory: "creditor",
    partyId: "s1",
    partyName: "Arvind Mills",
    contraAccount: "Raw Material Fabric Purchase A/c",
    particulars: "Tax invoice for 9,000 Mtrs Oxford Cotton Fabric under PO-2025-0234",
    referenceNumber: "PO-2025-0234",
    debit: 0,
    credit: 1807500,
    runningBalance: 1807500,
    balanceType: "Cr",
    currency: "INR",
    reconciled: true,
    status: "verified",
    tags: ["Fabric Purchase", "Arvind Mills"],
    createdBy: "Priyanka Tiwari (Accounts)"
  },
  {
    id: "led-4",
    entryDate: "2025-07-20",
    voucherNumber: "REC-2025-0045",
    voucherType: "Payment Receipt",
    accountCategory: "debtor",
    partyId: "b3",
    partyName: "Reliance Trends",
    contraAccount: "State Bank of India (Current A/c)",
    particulars: "Full payment received for Tax Invoice INV-2025-0090 via RTGS (UTR: RTGS-NEFT-99887766)",
    referenceNumber: "RTGS-NEFT-99887766",
    debit: 0,
    credit: 8478750,
    runningBalance: 0,
    balanceType: "Dr",
    currency: "INR",
    reconciled: true,
    status: "cleared",
    tags: ["Bank Remittance", "RTGS", "Full Settlement"],
    createdBy: "Priyanka Tiwari (Accounts)"
  },
  {
    id: "led-5",
    entryDate: "2025-07-21",
    voucherNumber: "INV-2025-0091",
    voucherType: "Sales Invoice",
    accountCategory: "debtor",
    partyId: "b2",
    partyName: "Marks & Spencer",
    contraAccount: "Export Sales A/c",
    particulars: "Export Commercial Invoice for 6,000 pcs Chino Trousers (ORD-2025-0002)",
    referenceNumber: "ORD-2025-0002",
    debit: 6200000,
    credit: 0,
    runningBalance: 6200000,
    balanceType: "Dr",
    currency: "INR",
    reconciled: true,
    status: "verified",
    tags: ["Export Sales", "M&S UK"],
    createdBy: "Priyanka Tiwari (Accounts)"
  },
  {
    id: "led-6",
    entryDate: "2025-07-22",
    voucherNumber: "REC-2025-0046",
    voucherType: "Payment Receipt",
    accountCategory: "debtor",
    partyId: "b2",
    partyName: "Marks & Spencer",
    contraAccount: "SBI Export EEFC A/c",
    particulars: "Wire TT remittance received (£30,000 @ ₹105) for shipment INV-2025-0091 (SWIFT: SWIFT-MS-771122)",
    referenceNumber: "SWIFT-MS-771122",
    debit: 0,
    credit: 3150000,
    runningBalance: 3050000,
    balanceType: "Dr",
    currency: "INR",
    reconciled: true,
    status: "cleared",
    tags: ["SWIFT TT", "Export Remittance"],
    createdBy: "Priyanka Tiwari (Accounts)"
  },
  {
    id: "led-7",
    entryDate: "2025-07-23",
    voucherNumber: "PUR-2025-0235",
    voucherType: "Purchase Bill",
    accountCategory: "creditor",
    partyId: "s4",
    partyName: "YKK India Pvt Ltd",
    contraAccount: "Trims & Accessories Purchase A/c",
    particulars: "8,500 Pcs YKK Invisible Zippers 20cm - Navy under PO-2025-0235",
    referenceNumber: "PO-2025-0235",
    debit: 0,
    credit: 213127,
    runningBalance: 213127,
    balanceType: "Cr",
    currency: "INR",
    reconciled: true,
    status: "verified",
    tags: ["Trims Purchase", "YKK Zippers"],
    createdBy: "Priyanka Tiwari (Accounts)"
  },
  {
    id: "led-8",
    entryDate: "2025-07-25",
    voucherNumber: "PAY-2025-0081",
    voucherType: "Vendor Payment",
    accountCategory: "creditor",
    partyId: "s1",
    partyName: "Arvind Mills",
    contraAccount: "HDFC Bank (Operative A/c)",
    particulars: "Electronic NEFT payment against Fabric Bill PUR-2025-0234 (UTR: HDFC-N-991823)",
    referenceNumber: "HDFC-N-991823",
    debit: 1807500,
    credit: 0,
    runningBalance: 0,
    balanceType: "Cr",
    currency: "INR",
    reconciled: true,
    status: "cleared",
    tags: ["Vendor Settlement", "NEFT"],
    createdBy: "Priyanka Tiwari (Accounts)"
  },
  {
    id: "led-9",
    entryDate: "2025-07-26",
    voucherNumber: "JWB-2025-0104",
    voucherType: "Job Work Bill",
    accountCategory: "contractor",
    partyId: "jw1",
    partyName: "Ace Embroidery Works",
    contraAccount: "Job Work / Processing Charges A/c",
    particulars: "Embroidery processing charges for 3,200 pcs front chest logo (ORD-2025-0002)",
    referenceNumber: "JW-2025-0044",
    debit: 0,
    credit: 144000,
    runningBalance: 144000,
    balanceType: "Cr",
    currency: "INR",
    reconciled: true,
    status: "verified",
    tags: ["Job Work", "Embroidery"],
    createdBy: "Priyanka Tiwari (Accounts)"
  },
  {
    id: "led-10",
    entryDate: "2025-07-27",
    voucherNumber: "PAY-2025-0082",
    voucherType: "Vendor Payment",
    accountCategory: "contractor",
    partyId: "jw1",
    partyName: "Ace Embroidery Works",
    contraAccount: "State Bank of India (Current A/c)",
    particulars: "Direct bank transfer for job work embroidery bill JWB-2025-0104",
    referenceNumber: "SBI-TR-102938",
    debit: 144000,
    credit: 0,
    runningBalance: 0,
    balanceType: "Cr",
    currency: "INR",
    reconciled: true,
    status: "cleared",
    tags: ["Job Work Payment", "Direct Transfer"],
    createdBy: "Priyanka Tiwari (Accounts)"
  },
  {
    id: "led-11",
    entryDate: "2025-07-28",
    voucherNumber: "PUR-2025-0240",
    voucherType: "Purchase Bill",
    accountCategory: "creditor",
    partyId: "s2",
    partyName: "Vardhman Textiles",
    contraAccount: "Raw Material Fabric Purchase A/c",
    particulars: "12,000 Mtrs Stretch Denim 11oz - Dark Indigo under PO-2025-0240",
    referenceNumber: "PO-2025-0240",
    debit: 0,
    credit: 4050000,
    runningBalance: 4050000,
    balanceType: "Cr",
    currency: "INR",
    reconciled: true,
    status: "verified",
    tags: ["Denim Fabric", "Vardhman"],
    createdBy: "Priyanka Tiwari (Accounts)"
  },
  {
    id: "led-12",
    entryDate: "2025-07-29",
    voucherNumber: "PAY-2025-0083",
    voucherType: "Vendor Payment",
    accountCategory: "creditor",
    partyId: "s2",
    partyName: "Vardhman Textiles",
    contraAccount: "State Bank of India (LC Facility)",
    particulars: "50% advance Letter of Credit (LC) established for stretch denim delivery",
    referenceNumber: "SBI-DLC-2025-88",
    debit: 2025000,
    credit: 0,
    runningBalance: 2025000,
    balanceType: "Cr",
    currency: "INR",
    reconciled: true,
    status: "verified",
    tags: ["Letter of Credit", "Advance"],
    createdBy: "Priyanka Tiwari (Accounts)"
  },
  {
    id: "led-13",
    entryDate: "2025-07-30",
    voucherNumber: "JWB-2025-0105",
    voucherType: "Job Work Bill",
    accountCategory: "contractor",
    partyId: "jw2",
    partyName: "Clean Wash Laundry",
    contraAccount: "Job Work Washing Charges A/c",
    particulars: "Enzyme washing and bio-softening processing on 5,000 pcs Denim (ORD-2025-0003)",
    referenceNumber: "JW-2025-0051",
    debit: 0,
    credit: 275000,
    runningBalance: 275000,
    balanceType: "Cr",
    currency: "INR",
    reconciled: true,
    status: "verified",
    tags: ["Enzyme Wash", "Job Work"],
    createdBy: "Priyanka Tiwari (Accounts)"
  },
  {
    id: "led-14",
    entryDate: "2025-07-31",
    voucherNumber: "PAY-2025-0090",
    voucherType: "Payroll Entry",
    accountCategory: "expense",
    partyName: "Factory Payroll & Worker Wages",
    contraAccount: "State Bank of India (Payroll A/c)",
    particulars: "Factory floor operators and staff monthly payroll net disbursement for July 2025",
    referenceNumber: "PAYROLL-JUL-2025",
    debit: 1872500,
    credit: 0,
    runningBalance: 1872500,
    balanceType: "Dr",
    currency: "INR",
    reconciled: true,
    status: "audited",
    tags: ["Wages", "Salary Disbursal", "Overtime"],
    createdBy: "Priyanka Tiwari (Accounts)"
  },
  {
    id: "led-15",
    entryDate: "2025-08-01",
    voucherNumber: "TAX-2025-0021",
    voucherType: "Journal Voucher",
    accountCategory: "tax",
    partyName: "GST Department (Govt of India)",
    contraAccount: "HDFC Electronic Cash Ledger",
    particulars: "Net GST payment for July 2025 (GSTR-3B) after ITC offset on fabric and trims",
    referenceNumber: "CPIN-250801991823",
    debit: 485600,
    credit: 0,
    runningBalance: 485600,
    balanceType: "Dr",
    currency: "INR",
    reconciled: true,
    status: "cleared",
    tags: ["GST Filing", "GSTR-3B", "Tax Settlement"],
    createdBy: "Priyanka Tiwari (Accounts)"
  },
  {
    id: "led-16",
    entryDate: "2025-08-03",
    voucherNumber: "EXP-2025-0044",
    voucherType: "Journal Voucher",
    accountCategory: "expense",
    partyName: "Rajasthan State Electricity Board (JVVNL)",
    contraAccount: "SBI Factory Utilities A/c",
    particulars: "HT Industrial Power Bill for Unit 1 (Palri) & Unit 2 stitching floor",
    referenceNumber: "JVVNL-HT-9921",
    debit: 365400,
    credit: 0,
    runningBalance: 365400,
    balanceType: "Dr",
    currency: "INR",
    reconciled: true,
    status: "cleared",
    tags: ["Electricity", "Factory Utilities"],
    createdBy: "Priyanka Tiwari (Accounts)"
  },
  {
    id: "led-17",
    entryDate: "2025-08-05",
    voucherNumber: "INV-2025-0092",
    voucherType: "Sales Invoice",
    accountCategory: "debtor",
    partyId: "b4",
    partyName: "Zara International (Inditex)",
    contraAccount: "Export Sales A/c",
    particulars: "Export Commercial Invoice for 12,500 pcs Cotton Poplin Blouses (ORD-2025-0004)",
    referenceNumber: "ORD-2025-0004",
    debit: 11250000,
    credit: 0,
    runningBalance: 11250000,
    balanceType: "Dr",
    currency: "INR",
    reconciled: true,
    status: "verified",
    tags: ["Export Sales", "Zara", "LC 60 Days"],
    createdBy: "Priyanka Tiwari (Accounts)"
  },
  {
    id: "led-18",
    entryDate: "2025-08-10",
    voucherNumber: "REC-2025-0047",
    voucherType: "Payment Receipt",
    accountCategory: "debtor",
    partyId: "b1",
    partyName: "Nordstrom Inc.",
    contraAccount: "SBI Export EEFC A/c",
    particulars: "Part payment received via Letter of Credit (LC #LC98211) for INV-2025-0089",
    referenceNumber: "LC-98211-PART1",
    debit: 0,
    credit: 4814000,
    runningBalance: 4814000,
    balanceType: "Dr",
    currency: "INR",
    reconciled: true,
    status: "cleared",
    tags: ["Letter of Credit", "Part Settlement"],
    createdBy: "Priyanka Tiwari (Accounts)"
  }
];

export function isSeedDataDisabled(): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem("garmentflow_seed_preloaded_data") === "false";
  }
  return false;
}

export function getInitialCollection<T>(dataset: T[]): T[] {
  if (isSeedDataDisabled()) {
    return [];
  }
  return dataset;
}


