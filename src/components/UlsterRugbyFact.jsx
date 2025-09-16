import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiInfo, FiRefreshCw, FiBookOpen, FiAward } = FiIcons;

const UlsterRugbyFact = () => {
  const [currentFact, setCurrentFact] = useState('');
  const [factIndex, setFactIndex] = useState(0);

  // Rugby facts now loaded from localStorage if available
  useEffect(() => {
    // Try to get facts from localStorage first
    const storedFacts = localStorage.getItem('ulsterRugbyFacts');
    let factsToUse = [];

    if (storedFacts) {
      factsToUse = JSON.parse(storedFacts);
    } else {
      // Fallback to default facts if none in localStorage
      factsToUse = [
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

      // Save default facts to localStorage
      localStorage.setItem('ulsterRugbyFacts', JSON.stringify(factsToUse));
    }

    // Generate a random fact on component mount and when visiting the page
    if (factsToUse.length > 0) {
      const randomIndex = Math.floor(Math.random() * factsToUse.length);
      setFactIndex(randomIndex);
      setCurrentFact(factsToUse[randomIndex]);
    }
  }, []);

  const getNewFact = () => {
    // Get updated facts from localStorage
    const storedFacts = localStorage.getItem('ulsterRugbyFacts');
    if (!storedFacts) return;

    const facts = JSON.parse(storedFacts);
    if (facts.length === 0) return;

    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * facts.length);
    } while (newIndex === factIndex && facts.length > 1);

    setFactIndex(newIndex);
    setCurrentFact(facts[newIndex]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white mb-8 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full -translate-y-8 -translate-x-8"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiBookOpen} className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <SafeIcon icon={FiInfo} className="w-5 h-5" />
                <span>Did You Know?</span>
              </h3>
              <p className="text-blue-100 text-sm">Ulster Schools Rugby History</p>
            </div>
          </div>
          
          <motion.button
            onClick={getNewFact}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white bg-opacity-20 text-white p-3 rounded-full hover:bg-opacity-30 transition-colors"
            title="Get new fact"
          >
            <SafeIcon icon={FiRefreshCw} className="w-5 h-5" />
          </motion.button>
        </div>

        <motion.div
          key={factIndex}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white bg-opacity-10 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiAward} className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-1" />
            <p className="text-white leading-relaxed">
              {currentFact}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UlsterRugbyFact;