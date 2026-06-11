<?php

namespace Database\Seeders;

use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Pink Serenity Bouquet',
                'slug' => 'pink-serenity',
                'category' => 'Flower Bouquet',
                'price' => 25000,
                'image' => '/products/pink-serenity.png',
                'description' => 'A graceful bouquet of blush roses and soft greenery, wrapped for a sweet campus surprise.',
                'stock' => 24,
            ],
            [
                'name' => 'Midnight Treats Box',
                'slug' => 'midnight-treats',
                'category' => 'Gift Box',
                'price' => 39000,
                'image' => '/products/midnight-treats.png',
                'description' => 'A refined snack box with rich treats and keepsake details for late study nights or milestone cheers.',
                'stock' => 12,
            ],
            [
                'name' => 'Golden Success Wrap',
                'slug' => 'golden-success',
                'category' => 'Graduation Gift',
                'price' => 19000,
                'image' => '/products/golden-success.png',
                'description' => 'Bright sunflower blooms wrapped in warm tones to celebrate achievement and new beginnings.',
                'stock' => 18,
            ],
            [
                'name' => 'Choco Dream Bouquet',
                'slug' => 'choco-dream',
                'category' => 'Snack Bouquet',
                'price' => 15000,
                'image' => '/products/choco-dream.png',
                'description' => 'A playful chocolate bouquet made for sweet congratulations, birthdays, and just-because moments.',
                'stock' => 16,
            ],
            [
                'name' => 'Minimalist Tulip Vase',
                'slug' => 'minimalist-tulip',
                'category' => 'Flower Bouquet',
                'price' => 32000,
                'image' => '/products/minimalist-tulip.png',
                'description' => 'Clean white tulips arranged with quiet elegance for a polished dorm desk or office delivery.',
                'stock' => 10,
            ],
            [
                'name' => "Scholar's Reward Box",
                'slug' => 'scholars-reward',
                'category' => 'Graduation Gift',
                'price' => 45000,
                'image' => '/products/scholars-reward.png',
                'description' => 'A thoughtful academic gift box with premium details for honoring hard work and future plans.',
                'stock' => 8,
            ],
            [
                'name' => 'Confetti Gift Box',
                'slug' => 'confetti-gift-box',
                'category' => 'Gift Box',
                'price' => 65000,
                'image' => '/birthdays/confetti-gift-box.png',
                'description' => 'A festive birthday gift box with a soft floral note and campus-ready presentation.',
                'stock' => 14,
            ],
            [
                'name' => 'Spring Awakening',
                'slug' => 'spring-awakening',
                'category' => 'Flower Bouquet',
                'price' => 45000,
                'image' => '/birthdays/spring-awakening.png',
                'description' => 'Fresh seasonal blooms for a bright birthday surprise.',
                'stock' => 18,
            ],
            [
                'name' => 'Birthday Blossoms',
                'slug' => 'birthday-blossoms',
                'category' => 'Birthday',
                'price' => 55000,
                'image' => '/birthdays/birthday-blossoms.png',
                'description' => 'A vibrant mix of seasonal blooms for joyful birthday deliveries.',
                'stock' => 20,
            ],
            [
                'name' => 'Sweet Surprise Bouquet',
                'slug' => 'sweet-surprise',
                'category' => 'Birthday',
                'price' => 70000,
                'image' => '/birthdays/sweet-surprise.png',
                'description' => 'Soft pastel blooms for a gentle and memorable birthday wish.',
                'stock' => 12,
            ],
            [
                'name' => 'Party Time',
                'slug' => 'party-time',
                'category' => 'Birthday',
                'price' => 48000,
                'image' => '/birthdays/party-time.png',
                'description' => 'Bright and energetic sunny tones for lively celebrations.',
                'stock' => 15,
            ],
            [
                'name' => 'The Grand Celebration',
                'slug' => 'grand-celebration',
                'category' => 'Birthday',
                'price' => 125000,
                'image' => '/birthdays/grand-celebration.png',
                'description' => 'A lush birthday bestseller with layered seasonal blooms for a major celebration.',
                'stock' => 10,
            ],
            [
                'name' => 'Artisanal Truffles',
                'slug' => 'artisanal-truffles',
                'category' => 'Gift Box',
                'price' => 35000,
                'image' => '/birthdays/artisanal-truffles.png',
                'description' => 'A polished sweet add-on for birthdays and campus milestones.',
                'stock' => 25,
            ],
            [
                'name' => 'The Honors Collection',
                'slug' => 'honors-collection',
                'category' => 'Graduation Gift',
                'price' => 125000,
                'image' => '/graduation/honors-collection.png',
                'description' => 'Premium roses and seasonal blooms designed for graduation achievements.',
                'stock' => 8,
            ],
            [
                'name' => 'Future Bright Petite',
                'slug' => 'future-bright-petite',
                'category' => 'Graduation Gift',
                'price' => 45000,
                'image' => '/graduation/future-bright-petite.png',
                'description' => 'A petite graduation arrangement with fresh tulips and clean greenery.',
                'stock' => 13,
            ],
            [
                'name' => 'The Alumni Assortment',
                'slug' => 'alumni-assortment',
                'category' => 'Graduation Gift',
                'price' => 95000,
                'image' => '/graduation/alumni-assortment.png',
                'description' => 'A premium keepsake assortment for alumni celebrations and sendoffs.',
                'stock' => 7,
            ],
            [
                'name' => 'Campus Cheer Bundle',
                'slug' => 'campus-cheer-bundle',
                'category' => 'Birthday',
                'price' => 28000,
                'image' => '/birthdays/birthday-blossoms.png',
                'description' => 'Colorful blooms curated for cheerful birthday deliveries across campus.',
                'stock' => 18,
            ],
            [
                'name' => 'Campus Book Bouquet',
                'slug' => 'campus-book-bouquet',
                'category' => 'Gift Box',
                'price' => 52000,
                'image' => '/occasions/campus-bouquet-books.png',
                'description' => 'A campus-minded bouquet presentation styled with books for a studious, thoughtful gift.',
                'stock' => 9,
            ],
            [
                'name' => 'Anniversary Roses',
                'slug' => 'anniversary-roses',
                'category' => 'Flower Bouquet',
                'price' => 88000,
                'image' => '/occasions/anniversary-roses.png',
                'description' => 'Classic red roses arranged with modern elegance for romantic milestones.',
                'stock' => 11,
            ],
            [
                'name' => 'Just Because Daisies',
                'slug' => 'just-because-daisies',
                'category' => 'Flower Bouquet',
                'price' => 30000,
                'image' => '/occasions/just-because-daisies.png',
                'description' => 'A light, easygoing daisy bouquet for spontaneous affection and everyday encouragement.',
                'stock' => 16,
            ],
            [
                'name' => 'The Graduation Bloom',
                'slug' => 'the-graduation-bloom',
                'category' => 'Graduation Gift',
                'price' => 450000,
                'image' => '/products/pink-serenity-clean.png',
                'description' => 'A premium graduation arrangement for major campus celebrations.',
                'stock' => 6,
            ],
            [
                'name' => 'Custom Gift Note',
                'slug' => 'custom-gift-note',
                'category' => 'Gift Note',
                'price' => 25000,
                'image' => '/products/pink-serenity-clean.png',
                'description' => 'A hand-lettered premium card for a personal Bloomify message.',
                'stock' => 100,
            ],
        ];

        foreach ($products as $product) {
            $storedProduct = Product::updateOrCreate(
                ['slug' => $product['slug']],
                $product + ['is_active' => true]
            );

            CartItem::where('product_id', $storedProduct->id)->update([
                'product_name' => $storedProduct->name,
                'product_price' => $storedProduct->price,
                'image' => $storedProduct->image,
                'category' => $storedProduct->category,
            ]);
        }
    }
}
