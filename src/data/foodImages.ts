/* ============================================
   Food & restaurant demo images
   Uses picsum.photos for reliable placeholder images.
   ============================================ */

// ─── Restaurant ambiance / cover photos ──────────────────────────────────
// Using picsum.photos for reliability — always serves a real image
export const COVERS: Record<string, string> = {
    'rest-001': 'https://picsum.photos/seed/punjab-cover/1200/600',
    'rest-002': 'https://picsum.photos/seed/madras-cover/1200/600',
    'rest-003': 'https://picsum.photos/seed/dragon-cover/1200/600',
    'rest-004': 'https://picsum.photos/seed/piazza-cover/1200/600',
    'rest-005': 'https://picsum.photos/seed/sushiko-cover/1200/600',
    'rest-006': 'https://picsum.photos/seed/biryani-cover/1200/600',
    'rest-007': 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&h=600&fit=crop&auto=format',
    'rest-008': 'https://picsum.photos/seed/tandoori-cover/1200/600',
}

// ─── Food close-ups (logo/avatar images) ─────────────────────────────────
export const LOGOS: Record<string, string> = { // All food close-ups from Unsplash
    'rest-001': 'https://images.unsplash.com/photo-1563379926898-05f4575a45d6?w=200&h=200&fit=crop&auto=format',
    'rest-002': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&h=200&fit=crop&auto=format',
    'rest-003': 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=200&h=200&fit=crop&auto=format',
    'rest-004': 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=200&h=200&fit=crop&auto=format',
    'rest-005': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop&auto=format',
    'rest-006': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=200&fit=crop&auto=format',
    'rest-007': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop&auto=format',
    'rest-008': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&h=200&fit=crop&auto=format',
}

// ─── Gallery photos (6 per restaurant) ───────────────────────────────────
export const GALLERIES: Record<string, string[]> = {
    'rest-001': [
        'https://picsum.photos/seed/punjab-g1/600/450',
        'https://picsum.photos/seed/punjab-g2/600/450',
        'https://picsum.photos/seed/punjab-g3/600/450',
        'https://picsum.photos/seed/punjab-g4/600/450',
        'https://picsum.photos/seed/punjab-g5/600/450',
        'https://picsum.photos/seed/punjab-g6/600/450',
    ],
    'rest-002': [
        'https://picsum.photos/seed/madras-g1/600/450',
        'https://picsum.photos/seed/madras-g2/600/450',
        'https://picsum.photos/seed/madras-g3/600/450',
        'https://picsum.photos/seed/madras-g4/600/450',
        'https://picsum.photos/seed/madras-g5/600/450',
        'https://picsum.photos/seed/madras-g6/600/450',
    ],
    'rest-003': [
        'https://picsum.photos/seed/dragon-g1/600/450',
        'https://picsum.photos/seed/dragon-g2/600/450',
        'https://picsum.photos/seed/dragon-g3/600/450',
        'https://picsum.photos/seed/dragon-g4/600/450',
        'https://picsum.photos/seed/dragon-g5/600/450',
        'https://picsum.photos/seed/dragon-g6/600/450',
    ],
    'rest-004': [
        'https://picsum.photos/seed/piazza-g1/600/450',
        'https://picsum.photos/seed/piazza-g2/600/450',
        'https://picsum.photos/seed/piazza-g3/600/450',
        'https://picsum.photos/seed/piazza-g4/600/450',
        'https://picsum.photos/seed/piazza-g5/600/450',
        'https://picsum.photos/seed/piazza-g6/600/450',
    ],
    'rest-005': [
        'https://picsum.photos/seed/sushiko-g1/600/450',
        'https://picsum.photos/seed/sushiko-g2/600/450',
        'https://picsum.photos/seed/sushiko-g3/600/450',
        'https://picsum.photos/seed/sushiko-g4/600/450',
        'https://picsum.photos/seed/sushiko-g5/600/450',
        'https://picsum.photos/seed/sushiko-g6/600/450',
    ],
    'rest-006': [
        'https://picsum.photos/seed/biryani-g1/600/450',
        'https://picsum.photos/seed/biryani-g2/600/450',
        'https://picsum.photos/seed/biryani-g3/600/450',
        'https://picsum.photos/seed/biryani-g4/600/450',
        'https://picsum.photos/seed/biryani-g5/600/450',
        'https://picsum.photos/seed/biryani-g6/600/450',
    ],
    'rest-007': [
        'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=450&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=450&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=450&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1466637574441-749b8d1946f4?w=600&h=450&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=450&fit=crop&auto=format',
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=450&fit=crop&auto=format',
    ],
    'rest-008': [
        'https://picsum.photos/seed/tandoori-g1/600/450',
        'https://picsum.photos/seed/tandoori-g2/600/450',
        'https://picsum.photos/seed/tandoori-g3/600/450',
        'https://picsum.photos/seed/tandoori-g4/600/450',
        'https://picsum.photos/seed/tandoori-g5/600/450',
        'https://picsum.photos/seed/tandoori-g6/600/450',
    ],
}

// ─── Review avatars (already set in dummyRestaurants.ts) ─────────────────
// Using picsum consistently: https://picsum.photos/seed/{id}-avatar/100/100
