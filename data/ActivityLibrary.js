// Static list of available activity cards
// Each activity includes id, name, and image
// Used by Library screen flatlist to render selectable cards

import Home from "../assets/visuals/home.svg";
import Toilet from "../assets/visuals/toilet.svg";
import Bath from "../assets/visuals/bath.svg";
import Bedtime from "../assets/visuals/bedtime.svg";
import Breakfast from "../assets/visuals/breakfast.svg";
import BrushTeeth from "../assets/visuals/brush-teeth.svg";
import GetDressed from "../assets/visuals/get-dressed.svg";
import Milk from "../assets/visuals/milk.svg";
import OrangeJuice from "../assets/visuals/orange-juice.svg";
import School from "../assets/visuals/school.svg";
import Water from "../assets/visuals/water.svg";
import Pajamas from "../assets/visuals/pajamas.svg";

export const activityLibrary = [
  {
    id: '1',
    name: 'home',
    image: Home,
    category: 'Places',
  },
  {
    id: '2',
    name: 'toilet',
    image: Toilet,
    category: 'Personal Care',
  },
  {
    id: '3',
    name: 'bath',
    image: Bath,
    category: 'Personal Care',
  },
  {
    id: '4',
    name: 'bedtime',
    image: Bedtime,
    category: 'Daily Routine',
  },
  {
    id: '5',
    name: 'breakfast',
    image: Breakfast,
    category: 'Food',
  },
  {
    id: '6',
    name: 'brush teeth',
    image: BrushTeeth,
    category: 'Personal Care',
  },
  {
    id: '7',
    name: 'get dressed',
    image: GetDressed,
    category: 'Daily Routine',
  },
  {
    id: '8',
    name: 'milk',
    image: Milk,
    category: 'Food',
  },
  {
    id: '9',
    name: 'orange juice',
    image: OrangeJuice,
    category: 'Food',
  },
  {
    id: '10',
    name: 'water',
    image: Water,
    category: 'Food',
  },
  {
    id: '11',
    name: 'school',
    image: School,
    category: 'Places',
  },
    {
    id: '12',
    name: 'pajamas',
    image: Pajamas,
    category: 'Clothes',
  },
]