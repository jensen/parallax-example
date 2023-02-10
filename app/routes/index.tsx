import {
  ParallaxProvider,
  ParallaxBanner,
  ParallaxBannerLayer,
  Parallax,
} from "react-scroll-parallax";
import { useState, useEffect, useRef } from "react";
import createScrollSnap from "scroll-snap";

interface SectionProps {
  index: number;
  registerSection: (index: number) => (element: HTMLDivElement) => void;
}

const Section = (props: SectionProps) => {
  return (
    <section
      className="section center-content background"
      style={{ backgroundImage: `url(/images/${props.index}.png)` }}
      ref={props.registerSection(props.index)}
    >
      <Parallax speed={25}>
        <article className="card">
          <h1>Header {props.index}</h1>
          <h3>Sub Header {props.index}</h3>
          <p>
            Proident voluptate ex ut minim non. Fugiat esse deserunt sint
            deserunt enim sint occaecat.
          </p>
          <button>Learn More</button>
        </article>
      </Parallax>
    </section>
  );
};

interface MenuItemProps {
  onClick: () => void;
  active: boolean;
  index: number;
}
export const MenuItem = (props: MenuItemProps) => {
  return (
    <li
      onClick={props.onClick}
      className={`menu-item ${props.active ? "menu-item--active" : ""}`}
    >
      {props.index}
    </li>
  );
};

interface MenuProps {
  setSection: (index: number) => void;
  currentSection: number;
}

export const Menu = (props: MenuProps) => {
  return (
    <ul className="menu">
      {new Array(5).fill(null).map((_, index) => (
        <MenuItem
          key={index}
          index={index}
          active={props.currentSection === index}
          onClick={() => props.setSection(index)}
        />
      ))}
    </ul>
  );
};

export default function Index() {
  const [currentSection, setCurrentSection] = useState(0);
  const [targetSection, setTargetSection] = useState(0);

  const checkRef = useRef(() => {
    return { targetSection };
  });
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(
    null
  );

  const sectionsRef = useRef<Record<number, HTMLDivElement>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  const registerSection = (index: number) => {
    return (element: HTMLDivElement) => {
      if (element) {
        sectionsRef.current[index] = element;
      }
    };
  };

  useEffect(() => {
    if (observerRef.current === null && scrollContainer) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
              const index = Object.values(sectionsRef.current).findIndex(
                (value) => value === entry.target
              );

              if (index !== undefined) {
                if (index === checkRef.current().targetSection) {
                  setCurrentSection(index);
                }
              }
            }
          });
        },
        { root: null, rootMargin: "0px", threshold: 0.5 }
      );

      for (const section of Object.values(sectionsRef.current)) {
        observerRef.current.observe(section);
      }
    }

    const element = sectionsRef.current[targetSection];

    checkRef.current = () => ({ targetSection });

    if (element && scrollContainer) {
      let sum = 0;
      for (let i = 0; i < targetSection; i++) {
        sum += sectionsRef.current[i].getBoundingClientRect().height;
      }

      scrollContainer.scrollTo({
        top: sum,
        behavior: "smooth",
      });

      return () => {
        scrollContainer.scrollBy({
          top: 0,
          behavior: "smooth",
        });
      };
    }
  }, [targetSection, scrollContainer]);

  useEffect(() => {
    if (targetSection === currentSection && scrollContainer) {
      const { unbind } = createScrollSnap(
        scrollContainer,
        {
          snapDestinationY: "100%",
          duration: 750,
          threshold: 0.01,
        },
        () => {
          const sections = Object.entries(sectionsRef.current);
          for (const [key, value] of sections) {
            const { top } = value.getBoundingClientRect();
            if (top >= 0 && top < 5) {
              setCurrentSection(Number(key));
              setTargetSection(Number(key));
            }
          }
        }
      );
      return () => {
        unbind();
      };
    }
  }, [targetSection, currentSection, scrollContainer]);

  return (
    <div className="container" ref={setScrollContainer}>
      {scrollContainer && (
        <ParallaxProvider scrollContainer={scrollContainer}>
          <ParallaxBanner className="mountains">
            <ParallaxBannerLayer image="/images/mid.svg" speed={20} />
          </ParallaxBanner>
          <Menu currentSection={targetSection} setSection={setTargetSection} />
          <div className="sections">
            <Section index={0} registerSection={registerSection} />
            <Section index={1} registerSection={registerSection} />
            <Section index={2} registerSection={registerSection} />
            <Section index={3} registerSection={registerSection} />
            <Section index={4} registerSection={registerSection} />
          </div>
        </ParallaxProvider>
      )}
    </div>
  );
}
