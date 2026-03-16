const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/seller/upload/page.tsx', 'utf8');

content = content.replace("import { Camera, Loader2, UploadCloud, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';", "import { Camera, Loader2, UploadCloud, ChevronLeft, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';\nimport { getMarketRate } from '@/lib/marketRates';");

content = content.replace("    price: '',\n", "");

content = content.replace("    e.preventDefault();\n    setLoading(true);\n", "    e.preventDefault();\n    setLoading(true);\n\n    const livePrice = getMarketRate(formData.material);\n");

content = content.replace("price: Number(formData.price || 0),", "price: livePrice,");
content = content.replace("suggested_price_inr: Number(formData.price || 0),", "suggested_price_inr: livePrice,");

content = content.replace("const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {", "const currentLivePrice = getMarketRate(formData.material || analysisResult?.prediction || analysisResult?.material || '');\n\n  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {");

content = content.replace(/<div className="relative">\s*<input\s*required\s*type="number"\s*step="0.01"\s*name="price"[\s\S]*?Price per Kg \(₹\)\s*<\/label>\s*<\/div>/, `<div className="relative bg-blue-50/50 border border-blue-100 rounded-2xl px-4 py-3 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center mb-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Live Market Price
                </span>
                <span className="font-black text-xl text-gray-900">₹{currentLivePrice > 0 ? currentLivePrice : '---'} <span className="text-sm font-medium text-gray-500">/ kg</span></span>
              </div>`);

fs.writeFileSync('src/app/dashboard/seller/upload/page.tsx', content);
