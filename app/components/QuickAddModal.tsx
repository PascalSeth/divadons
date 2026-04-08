import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCart } from '@/app/contexts/CartContext'
import Image from 'next/image'
import { formatCurrency } from '@/lib/currency'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productName: string
  productPrice: number | string
  productImage: string
  currency: string
}

interface Variant {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  stock: number;
}

interface ProductDetails {
  id: string;
  name: string;
  price: number | string;
  currency: string;
  images: string[];
  sizes?: string[];
  color?: string;
  subcategory?: string;
  variants?: Variant[];
}

export function QuickAddModal({
  isOpen,
  onClose,
  productId,
  productName,
  productPrice,
  productImage,
  currency
}: QuickAddModalProps) {
  const [loading, setLoading] = useState(false)
  const [productData, setProductData] = useState<ProductDetails | null>(null)
  
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [isAdding, setIsAdding] = useState(false)
  
  const { addToCart } = useCart()

  useEffect(() => {
    if (isOpen && !productData) {
      const fetchProduct = async () => {
        try {
          setLoading(true)
          const res = await fetch(`/api/products/${productId}`)
          const json = await res.json()
          if (json.success) {
            const data = json.data
            setProductData(data)
            
            // Extract unique colors from variants
            const uniqueColors = Array.from(new Set((data.variants || []).map((v: Variant) => v.color).filter(Boolean)))
            
            // Auto-select if only one option
            if (data.sizes?.length === 1) setSelectedSize(data.sizes[0])
            if (uniqueColors.length === 1) {
              setSelectedColor(uniqueColors[0] as string)
            } else if (data.color && uniqueColors.length === 0) {
              // Fallback to primary color if no variants have colors
              setSelectedColor(data.color)
            }
          }
        } catch (error) {
          console.error("Failed to load product details", error)
        } finally {
          setLoading(false)
        }
      }
      fetchProduct()
    }
  }, [isOpen, productId, productData])

  const handleAddToCart = () => {
    if (productData) {
      if (productData.sizes && productData.sizes.length > 0 && !selectedSize) {
        toast.error("Please select a size")
        return
      }

      const availableColors = Array.from(new Set((productData.variants || []).map(v => v.color).filter(Boolean)))
      if (availableColors.length > 0 && !selectedColor) {
        toast.error("Please select a color")
        return
      }
    }

    setIsAdding(true)
    
    // Slight delay for smooth UI feel
    setTimeout(() => {
      addToCart({
        productId,
        name: productName,
        price: Number(productPrice),
        image: productImage,
        quantity: 1,
        size: selectedSize || undefined,
        color: selectedColor || productData?.color || undefined,
      })
      
      toast.success(`${productName} added to cart!`)
      setIsAdding(false)
      onClose()
      
      // Reset selections
      setSelectedSize('')
      setSelectedColor('')
    }, 400)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-stone-50 border border-stone-200 shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-dm text-stone-900 tracking-tight">Quick Add</DialogTitle>
          <DialogDescription className="text-stone-500 font-mono text-xs">
            Select your preferences
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6">
          <div className="flex gap-6 mb-8">
            <div className="w-24 h-32 relative bg-stone-200 rounded-md overflow-hidden shrink-0">
              <Image src={productImage} alt={productName} fill className="object-cover" unoptimized />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="font-dm font-medium text-lg text-stone-900 leading-snug">{productName}</h3>
              <p className="font-mono font-bold text-stone-600 mt-2">
                {formatCurrency(productPrice, currency)}
              </p>
            </div>
          </div>
          
          {loading ? (
             <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#c9a84c]" />
             </div>
          ) : (
             <div className="space-y-6">
               {/* Size Selection */}
               {productData?.sizes && productData.sizes.length > 0 && (
                 <div className="space-y-3">
                   <div className="flex justify-between items-center">
                      <label className="text-xs uppercase tracking-widest font-bold text-stone-500">Size</label>
                      <span className="text-[10px] text-stone-400 font-mono italic">
                        {selectedSize ? `Selected: ${selectedSize}` : 'Required'}
                      </span>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {productData.sizes.map((size: string) => (
                       <button
                         key={size}
                         onClick={() => setSelectedSize(size)}
                         className={`h-10 px-4 flex items-center justify-center font-mono text-xs transition-all border ${
                           selectedSize === size
                             ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                             : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400 hover:bg-stone-50'
                         }`}
                       >
                         {size}
                       </button>
                     ))}
                   </div>
                 </div>
               )}

               {/* Color Selection */}
               {productData?.variants && Array.from(new Set(productData.variants.map((v: Variant) => v.color).filter(Boolean))).length > 0 && (
                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <label className="text-xs uppercase tracking-widest font-bold text-stone-500">Color</label>
                       <span className="text-[10px] text-stone-400 font-mono italic">
                         {selectedColor ? `Selected: ${selectedColor}` : 'Required'}
                       </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(productData.variants.map((v: Variant) => v.color).filter(Boolean))).map((color) => (
                        <button
                          key={color as string}
                          onClick={() => setSelectedColor(color as string)}
                          title={color as string}
                          className={`h-10 px-3 flex items-center gap-2 transition-all border ${
                            selectedColor === color
                              ? 'border-stone-900 bg-stone-50 shadow-sm'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <div 
                            className="w-4 h-4 rounded-full border border-stone-200" 
                            style={{ backgroundColor: color as string }} 
                          />
                          <span className="font-mono text-[10px] text-stone-600 capitalize">{color}</span>
                        </button>
                      ))}
                    </div>
                 </div>
               )}
               
               <Button 
                 onClick={handleAddToCart}
                 disabled={isAdding}
                 className="w-full h-12 bg-[#3d2e1a] text-[#c9a84c] hover:bg-[#2a1f11] font-dm text-sm uppercase tracking-widest transition-all rounded-none"
               >
                 {isAdding ? (
                   <span className="flex items-center gap-2">
                     <Loader2 className="w-4 h-4 animate-spin" />
                     Adding...
                   </span>
                 ) : (
                   "Add to Cart"
                 )}
               </Button>
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
