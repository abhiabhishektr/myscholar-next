"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["personalized", "expert", "one-on-one", "effective", "transformative"],
    [],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full bg-gradient-to-b from-transparent to-blue-50/50 dark:to-blue-950/20">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="MyScholar Logo"
              width={200}
              height={80}
              className="h-16 md:h-20 w-auto object-contain"
            />
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Learning made
              </span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-blue-700 dark:text-blue-300"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-gray-600 dark:text-gray-300 max-w-2xl text-center">
              Guiding young minds to brilliance. Get personalized one-on-one tutoring
              for KG-12th grade students with expert mentors.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button size="lg" className="gap-4 bg-blue-600 hover:bg-blue-700 text-white" asChild>
              <a href="/auth/register">
                Start Free Demo <MoveRight className="w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" className="gap-4 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950" variant="outline" asChild>
              <a href="/dashboard">View Dashboard</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
