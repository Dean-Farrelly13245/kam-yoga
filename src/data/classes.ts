export interface ClassItem {
  id: string;
  title: string;
  type: "yoga" | "meditation" | "workshop" | "kids";
  description: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  price: number;
  spotsLeft: number;
  totalSpots: number;
  instructor: string;
}

export const classesData: ClassItem[] = [
  {
    id: "1",
    title: "Gentle Morning Dru Yoga",
    type: "yoga",
    description: "Start your day with flowing Dru sequences, breathwork, and deep relaxation. Suitable for all levels.",
    date: "2025-01-20",
    time: "09:00",
    duration: "75 min",
    location: "Studio - Dublin",
    price: 18,
    spotsLeft: 6,
    totalSpots: 12,
    instructor: "Kellyann",
  },
  {
    id: "2",
    title: "Evening Restorative Yoga",
    type: "yoga",
    description: "Unwind and release the day's tension with gentle poses, props, and guided relaxation.",
    date: "2025-01-21",
    time: "19:00",
    duration: "60 min",
    location: "Studio - Dublin",
    price: 16,
    spotsLeft: 4,
    totalSpots: 10,
    instructor: "Kellyann",
  },
  {
    id: "3",
    title: "Breath & Stillness Meditation",
    type: "meditation",
    description: "A guided journey inward using breath awareness and Dru meditation techniques.",
    date: "2025-01-22",
    time: "18:30",
    duration: "45 min",
    location: "Online via Zoom",
    price: 12,
    spotsLeft: 15,
    totalSpots: 20,
    instructor: "Kellyann",
  },
  {
    id: "4",
    title: "Heart-Centred Meditation",
    type: "meditation",
    description: "Connect with your heart space through visualisation and loving-kindness practices.",
    date: "2025-01-24",
    time: "10:00",
    duration: "45 min",
    location: "Studio - Dublin",
    price: 12,
    spotsLeft: 8,
    totalSpots: 12,
    instructor: "Kellyann",
  },
  {
    id: "5",
    title: "Winter Wellness Workshop",
    type: "workshop",
    description: "A 3-hour immersion exploring yoga, meditation, and self-care practices for the winter season.",
    date: "2025-01-25",
    time: "10:00",
    duration: "3 hours",
    location: "Studio - Dublin",
    price: 55,
    spotsLeft: 3,
    totalSpots: 15,
    instructor: "Kellyann",
  },
  {
    id: "6",
    title: "Stress Relief & Relaxation",
    type: "workshop",
    description: "Learn practical tools for managing stress including breathing techniques, gentle movement, and meditation.",
    date: "2025-02-01",
    time: "14:00",
    duration: "2.5 hours",
    location: "Online via Zoom",
    price: 40,
    spotsLeft: 12,
    totalSpots: 25,
    instructor: "Kellyann",
  },
  {
    id: "7",
    title: "Rainbow Kids Yoga (Ages 5-8)",
    type: "kids",
    description: "Playful yoga adventures with stories, songs, and imaginative movement for little ones.",
    date: "2025-01-26",
    time: "10:00",
    duration: "45 min",
    location: "Studio - Dublin",
    price: 10,
    spotsLeft: 5,
    totalSpots: 10,
    instructor: "Kellyann",
  },
  {
    id: "8",
    title: "Teen Mindfulness Yoga",
    type: "kids",
    description: "Yoga and mindfulness designed for teens, building confidence, focus, and emotional resilience.",
    date: "2025-01-27",
    time: "16:00",
    duration: "60 min",
    location: "Studio - Dublin",
    price: 12,
    spotsLeft: 7,
    totalSpots: 12,
    instructor: "Kellyann",
  },
];

export const classTypes = [
  { value: "all", label: "All Classes" },
  { value: "yoga", label: "Yoga" },
  { value: "meditation", label: "Meditation" },
  { value: "workshop", label: "Workshops" },
  { value: "kids", label: "Children's" },
] as const;
