
import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

const animationUrls = {
    confetti: 'https://assets10.lottiefiles.com/packages/lf20_u4yrau.json',
};

export function AnimationPreview({ animation }: { animation: keyof typeof animationUrls | 'none' | '' }) {
    const [animationData, setAnimationData] = useState<any>(null);

    useEffect(() => {
        let isCancelled = false;
        setAnimationData(null);

        if (animation && animationUrls[animation as keyof typeof animationUrls]) {
            fetch(animationUrls[animation as keyof typeof animationUrls])
                .then(response => response.json())
                .then(data => {
                    if (!isCancelled) {
                       setAnimationData(data);
                    }
                });
        }
        
        return () => {
            isCancelled = true;
        };
    }, [animation]);

    if (!animationData) {
        return null;
    }

    return (
        <div className="mt-4 p-4 border rounded-md bg-muted/40 flex justify-center items-center">
            <div className="w-32 h-32">
                 <Lottie animationData={animationData} loop={true} />
            </div>
        </div>
    );
}
