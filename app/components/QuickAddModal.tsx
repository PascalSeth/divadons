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
  const [productData, setProductData] = useState<any>(null)
  
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
            setProductData(json.data)
            // Auto-select if only one option
            if (json.data.sizes?.length === 1) setSelectedSize(json.data.sizes[0])
            if (json.data.color) setSelectedColor(json.data.color) // if singular color field
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
      // Assuming 'variants' might define multiple colors, but currently Schema has 'color' field on Product.
      // If we strictly need color selection, add it here.
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
