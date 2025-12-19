export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: "reflections" | "practice" | "meditation" | "lifestyle";
  author: string;
  date: string;
  readTime: string;
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "finding-stillness-in-chaos",
    title: "Finding Stillness in the Midst of Chaos",
    excerpt: "In our busy modern lives, stillness can feel like a luxury. But what if it were as essential as breathing?",
    content: `In our busy modern lives, stillness can feel like a luxury. We rush from one task to another, our minds constantly buzzing with to-do lists, worries, and plans. But what if stillness were as essential as breathing?

Over my years of practice and teaching, I have come to understand that stillness is not something we find outside ourselves. It is not a place we travel to or a state we achieve through perfection. Stillness lives within us, always present, always waiting.

## The Practice of Pausing

The first step toward stillness is deceptively simple: pause. Before you react, before you rush to the next thing, take one conscious breath. This single breath is a bridge between doing and being.

In Dru Yoga, we often begin with what we call the "pause of peace" — a moment of complete presence before movement begins. This pause is not passive. It is alive with awareness.

## Stillness in Movement

Paradoxically, some of the deepest stillness I have experienced has come through movement. When we flow through yoga sequences with full presence, the mind quietens. The body becomes a vehicle for meditation.

Try this: in your next practice, focus not on the destination of each pose, but on the journey between poses. Notice the subtle shifts of weight, the dance of breath and muscle. Here, in the transitions, stillness reveals itself.

## A Daily Invitation

I invite you to find three moments today — just three — where you can pause and breathe consciously. Perhaps before your morning tea, during a walk, or before sleep. These small pauses are seeds of stillness that, with time, grow into a garden of peace.

Remember: you do not need to go anywhere to find stillness. You only need to arrive where you already are.`,
    category: "reflections",
    author: "Kellyann",
    date: "2025-01-15",
    readTime: "5 min read",
    featured: true,
  },
  {
    id: "2",
    slug: "breath-as-anchor",
    title: "The Breath as Your Anchor",
    excerpt: "Exploring the profound simplicity of breath awareness and how it can transform your daily experience.",
    content: `The breath is always with us, yet we so rarely notice it. Like a faithful companion, it accompanies us through every moment of our lives, asking nothing in return.

In the Dru tradition, we understand the breath as prana — life force energy. When we breathe consciously, we are not just taking in oxygen. We are inviting vitality, clarity, and presence into our being.

## The Anatomy of a Conscious Breath

A truly conscious breath has three parts: the inhalation, the exhalation, and the spaces between. Each part offers its own gifts.

The inhalation is an opening, an expansion, a receiving. The exhalation is a release, a letting go, a giving back. And the pauses — those precious moments of stillness between breaths — are windows into our deepest nature.

## A Simple Practice

Sit comfortably, or lie down if you prefer. Close your eyes gently. Begin to notice your breath without trying to change it.

After a few moments, deepen your breath slightly. Breathe into your belly first, then your ribs, then your chest. Exhale slowly, emptying from chest to ribs to belly.

Continue for five breaths. Then let your breathing return to its natural rhythm and simply observe.

This practice, done even once a day, can shift your entire relationship with stress, anxiety, and overwhelm.

## Breath in Daily Life

The beauty of breath awareness is that it requires no special equipment, no dedicated time, no perfect conditions. You can return to your breath while waiting in line, during a difficult conversation, or in the middle of a busy day.

Your breath is always there, always ready to bring you home to yourself.`,
    category: "practice",
    author: "Kellyann",
    date: "2025-01-10",
    readTime: "4 min read",
  },
  {
    id: "3",
    slug: "morning-rituals-for-presence",
    title: "Morning Rituals for Cultivating Presence",
    excerpt: "How the first moments of your day can set the tone for everything that follows.",
    content: `The way we begin our mornings shapes the texture of our entire day. Before the world rushes in with its demands, we have a precious window of possibility.

I have experimented with many morning practices over the years. Some have stayed with me; others have served their purpose and moved on. What remains constant is the intention: to begin each day with presence rather than reactivity.

## Before Reaching for the Phone

This might be the most radical act of self-care in our modern age: not looking at your phone for the first hour of the day. Instead, what if you looked inward?

Before your feet touch the floor, take three deep breaths. Set a simple intention for the day — not a to-do list, but a quality you wish to embody. Perhaps patience, perhaps joy, perhaps openness.

## Movement as Morning Prayer

Even five minutes of gentle movement can transform your morning. Simple stretches, a few rounds of cat-cow, or a short sun salutation sequence — these are not exercises, but offerings to your body.

Move slowly. There is no rush. Let your breath lead the movement, not the other way around.

## The Sacred Ordinary

Making tea or coffee can be a meditation. Feel the warmth of the cup in your hands. Notice the steam rising. Taste fully.

In Zen, they speak of "chopping wood, carrying water" as the path to enlightenment. Our morning rituals are no different. Every ordinary act, done with presence, becomes sacred.

## An Invitation

Tomorrow morning, try waking fifteen minutes earlier than usual. Use this time not for productivity, but for presence. See what shifts in your day.`,
    category: "lifestyle",
    author: "Kellyann",
    date: "2025-01-05",
    readTime: "4 min read",
  },
  {
    id: "4",
    slug: "heart-centred-meditation",
    title: "An Introduction to Heart-Centred Meditation",
    excerpt: "Discovering the transformative power of connecting with your heart space in meditation practice.",
    content: `In many meditation traditions, the focus is on the mind — calming thoughts, developing concentration, achieving clarity. These are valuable practices. But there is another approach that I have found equally, if not more, transformative: heart-centred meditation.

The heart, in yogic philosophy, is not just a physical organ. It is a centre of wisdom, compassion, and connection. When we meditate from the heart, we access a different quality of awareness.

## The Heart Space

Place your hand on your chest. Feel the gentle rhythm of your heartbeat. This area, in the centre of your chest, is what we call the heart space or anahata chakra.

Unlike the busy mind, the heart does not analyse or judge. It simply feels, connects, and knows. When we learn to rest our awareness here, we discover a profound sense of peace.

## A Heart-Centred Practice

Find a comfortable seated position. Close your eyes and take several deep breaths to settle.

Bring your awareness to the centre of your chest. Imagine breathing directly into and out of this space. With each breath, sense the area softening, opening.

Now, bring to mind something or someone you love unconditionally — perhaps a pet, a child, or a place in nature. Feel the warmth that arises in your heart. Let this feeling expand with each breath.

Rest here for as long as feels comfortable. When you are ready, gently open your eyes.

## Living from the Heart

Heart-centred practice extends beyond formal meditation. It is a way of living — making decisions from a place of love rather than fear, connecting with others through empathy, and treating ourselves with the same compassion we would offer a dear friend.

The heart knows things the mind cannot understand. Trust it.`,
    category: "meditation",
    author: "Kellyann",
    date: "2024-12-28",
    readTime: "5 min read",
  },
  {
    id: "5",
    slug: "yoga-beyond-poses",
    title: "Yoga Beyond the Poses: Living Your Practice",
    excerpt: "True yoga is not what happens on the mat, but how we carry its lessons into everyday life.",
    content: `When most people think of yoga, they picture poses — bodies twisted into impressive shapes on colourful mats. And while asana practice is a beautiful part of yoga, it is just one small piece of a much larger picture.

The word yoga means "to yoke" or "to unite." It speaks to the joining of body, mind, and spirit. It points toward connection — with ourselves, with others, with something greater than ourselves.

## The Eight Limbs

In the Yoga Sutras, Patanjali outlines eight limbs of yoga. Asana — the physical postures — is only the third limb. Before it come the yamas and niyamas: ethical guidelines for how we treat others and ourselves.

These include non-violence, truthfulness, non-stealing, moderation, and non-attachment. They include cleanliness, contentment, self-discipline, self-study, and surrender.

## Yoga in the Checkout Queue

Here is where yoga gets real. It is easy to be peaceful on the mat in a quiet studio. But can you maintain that peace when someone cuts in front of you in line? When your partner says something that triggers you? When plans fall apart?

This is the practice. Every moment of irritation is an opportunity to choose patience. Every conflict is an invitation to practise non-violence in thought and speech. Every loss is a chance to explore non-attachment.

## The Mat as Laboratory

I have come to see my time on the yoga mat as a laboratory for life. The challenges I face in practice — holding a difficult pose, staying present when my mind wanders, accepting my body as it is today — mirror the challenges of daily living.

What I learn on the mat, I carry into the world. And what I encounter in the world, I bring back to the mat for deeper exploration.

## Your Living Practice

Ask yourself: How can I embody yoga today? Not through poses, but through presence. Not through perfection, but through compassion.

This is the yoga that transforms us.`,
    category: "reflections",
    author: "Kellyann",
    date: "2024-12-20",
    readTime: "5 min read",
    featured: true,
  },
];

export const blogCategories = [
  { value: "all", label: "All Posts" },
  { value: "reflections", label: "Reflections" },
  { value: "practice", label: "Practice" },
  { value: "meditation", label: "Meditation" },
  { value: "lifestyle", label: "Lifestyle" },
] as const;
