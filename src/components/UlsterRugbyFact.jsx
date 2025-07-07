import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiInfo, FiRefreshCw } = FiIcons;

const UlsterRugbyFact = () => {
  const [currentFact, setCurrentFact] = useState('');
  const [factIndex, setFactIndex] = useState(0);

  const ulsterRugbyFacts = [
    "The Ulster Schools' Cup was first contested in 1876.",
    "The Ulster Schools' Cup is considered the second oldest rugby competition in the world that has run every season since it began.",
    "The Ulster Schools' Cup is open to schools that are affiliated to the Ulster Branch of the Irish Rugby Football Union.",
    "Ulster Schools' Cup finals are played at Kingspan Stadium in Belfast, a ground more widely known as Ravenhill.",
    "The Ulster Schools' Cup trophy is a silver cup with three handles mounted on a shield shaped plinth.",
    "Methodist College Belfast has won the Ulster Schools' Cup outright thirty seven times and shared it twice.",
    "Wallace High School in Lisburn hold the Ulster Schools' Cup after securing their first outright victory.",
    "Royal School Armagh became the first Ulster Schools' Cup champions in 1876.",
    "Eighteen different schools have won the Ulster Schools' Cup.",
    "The Ulster Schools' Cup final moved to Ravenhill in 1924; earlier finals had been played at Balmoral, Cross Parade, and once at Windsor Park.",
    "When the original Ulster Schools' Cup ran out of space for engraving it was fixed to a wooden shield; a new shield was donated for the centenary season and first won by Royal School Armagh in 1977.",
    "The Ulster Schools' Cup final is usually held on Saint Patrick's Day and is broadcast live by BBC Northern Ireland.",
    "Since a rule change in 1942, drawn Ulster Schools' Cup finals have been shared without replay; shared titles occurred in 1942, 1953, 1954, 1960, 1962, 1963, 1964, and 1996.",
    "A restructuring in the 2003 to 2004 season introduced qualifying rounds to the Ulster Schools' Cup to prevent one sided ties and give weaker teams a longer season.",
    "Teams that lose in the first round of the Ulster Schools' Cup play for the Schools Trophy, second round losers contest the Schools Bowl, and third round losers compete for the Schools Shield.",
    "The Subsidiary Shield, now known as the Schools Shield, was first awarded within the Ulster Schools' Cup structure in 1971 and gained its own trophy in 1980.",
    "The original wooden shield linked to the Ulster Schools' Cup is on display at Ulster Rugby headquarters at Ravenhill.",
    "The Medallion Shield was founded in 1910.",
    "The Medallion Shield is organised for schools that belong to the Ulster Branch of the Irish Rugby Football Union and today only schools in Northern Ireland take part.",
    "Medallion Shield squads must be made up of boys who are under fifteen on the first day of the school year.",
    "Fourteen schools have won or shared the Medallion Shield since it began.",
    "Thirty eight schools entered the Medallion Shield in the 2012 to 2013 season and the same number entered in 2013 to 2014.",
    "Royal Belfast Academical Institution leads the Medallion Shield roll of honour with thirty eight outright wins and three shared titles.",
    "Methodist College Belfast ranks second in the Medallion Shield with thirty six outright wins and three shared titles.",
    "In the 2025 Medallion Shield final Royal Belfast Academical Institution beat Friends' School Lisburn thirty eight to seven at Ravenhill.",
    "In the 2024 Medallion Shield final Royal Belfast Academical Institution defeated Sullivan Upper thirty six to ten.",
    "Since 1973 every Medallion Shield final has been played at Ravenhill except in 2014 when redevelopment work moved the match to Queen's University Arena.",
    "The first prize in the Medallion Shield was a medal given to the winning captain in 1911; the medal was later mounted on a shield donated by Methodist College and that original shield is now displayed in the Methodist College Heritage Centre.",
    "Control of the Medallion Shield passed from the founding schools to the Ulster Branch IRFU in 1977.",
    "The Medallion Plate, for teams knocked out in the opening round of the Medallion Shield, was introduced in 1986.",
    "A seeding system was brought into the Medallion Shield in 2004 and from 2005 the draw has used four entry stages with the top eight seeds joining at stage four.",
    "Only Methodist College Belfast and Royal Belfast Academical Institution contested the first five Medallion Shield finals from 1910 to 1914.",
    "The idea for the Medallion Shield grew from 1909 talks among Belfast Royal Academy, Campbell College, Methodist College, and Royal Belfast Academical Institution following the popularity of the new Leinster Schools Junior Cup.",
    "The Medallion Shield was not contested in 2021 because of the COVID 19 pandemic.",
    "Teams knocked out of the Medallion Shield now have subsidiary events, the Medallion Plate, Medallion Bowl, and Medallion Trophy, that give them extra matches.",
    "Future Ireland international James B. O'Neill played for Methodist College in the first Medallion Shield final in 1910.",
    "Sullivan Upper ranks tenth in the Medallion Shield with two outright wins and one runner-up.",
    "Sullivan Upper won the Medallion Shield in 2011 beating Limavady Grammar 17-0 in the final.",
    "Sullivan Upper won the Medallion Shield in 2002 beating Regent House 10-8 in the final.",
    "Sullivan Upper won the Medallion Plate in 2016 beating Campbell College 12-10 in the final.",
    "Sullivan Upper won the Medallion Plate in 2022 beating Rainey Endowed 22-12 in the final."
  ];

  useEffect(() => {
    // Generate a random fact on component mount and when visiting the page
    const randomIndex = Math.floor(Math.random() * ulsterRugbyFacts.length);
    setFactIndex(randomIndex);
    setCurrentFact(ulsterRugbyFacts[randomIndex]);
  }, []);

  const getNewFact = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * ulsterRugbyFacts.length);
    } while (newIndex === factIndex && ulsterRugbyFacts.length > 1);
    
    setFactIndex(newIndex);
    setCurrentFact(ulsterRugbyFacts[newIndex]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-gradient-to-r from-green-100 to-gray-100 rounded-lg p-6 border-l-4 border-green-600"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
          <SafeIcon icon={FiInfo} className="w-5 h-5 text-green-600" />
          <span>Ulster Schools Rugby Fact</span>
        </h3>
        <button
          onClick={getNewFact}
          className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
          title="Get new fact"
        >
          <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
        </button>
      </div>
      <motion.p
        key={factIndex}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="text-gray-700 leading-relaxed"
      >
        {currentFact}
      </motion.p>
    </motion.div>
  );
};

export default UlsterRugbyFact;