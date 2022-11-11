import { component$, useClientEffect$, useStore, useStylesScoped$ } from '@builder.io/qwik';
import { DocumentHead, useLocation } from '@builder.io/qwik-city';
import { RequestHandler } from '~/qwik-city/runtime/src';
import styles from './flower.css?inline';


export interface ProductDetails {
    title: string;
    description: string;
    price: string;
    timeStamp: string;
    random: number;
}

export const onGet: RequestHandler<ProductDetails> = async (request) => {
    //pretend database fetch
    console.log(request);
    return {
        title: "Flowers",
        description: "🌹🌷💐💐🌼🌻💐🌺🌺🌹🌼💐",
        price: "$70",
        timeStamp: (new Date()).toLocaleTimeString(),
        random: Math.random(),
    }
}


export default component$(() => {
    useStylesScoped$(styles);
    const loc = useLocation();

    const state = useStore({
        count: 0,
        number: 20,
    });

    useClientEffect$(({ cleanup }) => {
        const timeout = setTimeout(() => (state.count = 1), 500);
        cleanup(() => clearTimeout(timeout));

        const internal = setInterval(() => state.count++, 7000);
        cleanup(() => clearInterval(internal));
    });

    return (
        <>
            <input
                type="range"
                value={state.number}
                max={50}
                onInput$={(ev) => {
                    state.number = (ev.target as HTMLInputElement).valueAsNumber;
                }}
            />
            <div
                style={{
                    '--state': `${state.count * 0.1}`,
                }}
                class={{
                    host: true,
                    pride: loc.query['pride'] === 'true',
                }}
            >
                {Array.from({ length: state.number }, (_, i) => (
                    <div
                        key={i}
                        class={{
                            square: true,
                            odd: i % 2 === 0,
                        }}
                        style={{ '--index': `${i + 1}` }}
                    />
                )).reverse()}
            </div>
        </>
    );
});

export const head: DocumentHead = {
    title: 'Qwik Flower',
};
