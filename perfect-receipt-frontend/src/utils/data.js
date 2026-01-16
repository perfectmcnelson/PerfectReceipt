

import {
  FileText,
  Receipt,
  CloudUpload,
  CreditCard,
  Lock,
  BarChart3,
  LayoutDashboard,
  Users,
  Plus,
  File,
  DollarSign,
  CheckCircle,
  Settings,
} from "lucide-react";

export const features = [
  {
    icon: FileText,
    title: "Create Smart Invoices",
    description:
      "Design and send professional invoices in seconds with automatic numbering, due dates, and tax calculations built right in.",
  },
  {
    icon: Receipt,
    title: "Instant Receipts",
    description:
      "Generate sleek digital receipts immediately after payment—linked to your invoices or issued independently when needed.",
  },
  {
    icon: CloudUpload,
    title: "Cloud-Based Storage",
    description:
      "Keep all your invoices, receipts, and uploaded files organized securely in the cloud, accessible from any device, anywhere.",
  },
  {
    icon: CreditCard,
    title: "Integrated Payments",
    description:
      "Upgrade plans or process client payments with ease using Paystack or Flutterwave, featuring automatic confirmations and updates.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Track income, monitor transactions, and export summaries that give you clear insight into your financial performance.",
  },
  {
    icon: Lock,
    title: "Secure & Reliable",
    description:
      "Your data is encrypted, backed up, and protected with bank-level security to keep your business safe at all times.",
  },
];

// testimonialsData.js
export const testimonials = [
  {
    quote:
      "PerfectReceipt has completely transformed how I manage my business. Creating invoices and receipts is now effortless — I can send documents to clients within minutes.",
    author: "Chioma Adeyemi",
    title: "Freelance Designer",
    avatar: "/images/testimonial-female-1.jpg",
  },
  {
    quote:
      "I love how everything is in one place. The app’s clean interface and auto-calculations make generating invoices so simple. Plus, clients love the professional look!",
    author: "Tunde Alabi",
    title: "Founder, T-Squared Agency",
    avatar: "/images/testimonial-male-1.jpg",
  },
  {
    quote:
      "Before PerfectReceipt, I was juggling multiple tools for billing and receipts. Now, everything is integrated, backed up, and easily accessible — I can’t imagine switching back.",
    author: "Aisha Mohammed",
    title: "Event Planner",
    avatar: "/images/testimonial-female-2.jpg",
  }
];

// faqData.js
export const faqs = [
  {
    question: "What is PerfectReceipt?",
    answer:
      "PerfectReceipt is an all-in-one web platform that allows you to create, manage, and store professional invoices and receipts securely in the cloud. It’s designed for freelancers, entrepreneurs, and businesses who want to simplify their billing process.",
  },
  {
    question: "Do I need to install any app to use it?",
    answer:
      "No, you don’t need to install anything. PerfectReceipt runs entirely online, so you can access your account from any device — desktop, tablet, or smartphone — through your web browser.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. Your data is encrypted and stored safely using cloud security standards. Only you can access your invoices and receipts, and backups are automatically maintained for reliability.",
  },
  {
    question: "Can I use PerfectReceipt for free?",
    answer:
      "Yes! There’s a free plan that allows you to create and manage a limited number of invoices and receipts each month. You can upgrade anytime to unlock more storage, remove ads, and access advanced tools.",
  },
  {
    question: "What happens when I reach my storage limit?",
    answer:
      "When you approach your limit, you’ll receive a notification. You can then either delete older files to free space or upgrade your plan for higher storage and additional features.",
  },
  {
    question: "Can I create invoices in different currencies?",
    answer:
      "Yes, you can select different currencies based on your client’s location. PerfectReceipt supports multiple currency formats for international invoicing.",
  },
  {
    question: "How do I send invoices or receipts to clients?",
    answer:
      "After creating a document, you can download it as a PDF or share it directly via email or link. Paid users can also include their logo and brand colors in every document.",
  },
  {
    question: "What payment methods are supported for upgrades?",
    answer:
      "PerfectReceipt integrates with Paystack and Flutterwave, allowing secure payments through debit/credit cards, bank transfers, and mobile wallets.",
  },
];

export const NAVIGATION_MENU = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard},
    {id: "Invoices", icon: FileText, items: [
        { id: "invoices", name: "All Invoices", icon: File},
        { id: "invoices/new", name: "Create Invoice", icon: Plus},
    ]},
    {id: "Receipts", icon: CheckCircle, items: [
        { id: "receipts", name: "All Receipts", icon: DollarSign},
    ]},
    { id: "profile", name: "Profile", icon: Users},
    { id: "settings", name: "Settings", icon: Settings},
    { id: "upgrade-plan", name: "Upgrade Plan", icon: CreditCard},
    { id: "security", name: "Security", icon: Lock},
]