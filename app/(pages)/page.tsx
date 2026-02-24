import React from 'react'
import Hero from '../components/Hero'
import Collections from '../components/Collections'
import CategoriesShowcase from '../components/Categories'
import { 
  FeaturedStory, 
  Testimonials, 
  InstagramFeed, 
  Values, 
  Newsletter,
  ShippingInfo 
} from '../components/HomeSections'



export default function page() {
  return (
    <div>
      {/* Hero Section */}
      <Hero />
      

      {/* Categories Showcase */}
      <CategoriesShowcase />
      
      {/* Collections Carousel */}
      <Collections />
      
      {/* Featured Artisan Story */}
      {/* <FeaturedStory /> */}
      
      {/* Core Values */}
      <Values />
      
        {/* Shipping Info Bar */}
      <ShippingInfo />
      
          {/* Customer Testimonials */}
      <Testimonials />
      
      {/* Instagram Feed */}
      <InstagramFeed />
      
      {/* Newsletter Signup */}
      <Newsletter />
    </div>
  )
}