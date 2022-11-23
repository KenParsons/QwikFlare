import { component$, Signal, useServerMount$, useSignal, useStore } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Link } from '@builder.io/qwik-city';


export const MyComp = component$<{ parentSignal?: Signal<number> }>((props) => {
    const childSignal = useSignal(42); //just an arbitrary default value here
    const signalToUse = props.parentSignal || childSignal
    return <input
        value={signalToUse.value}
        onChange$={event => {
            const target = event.target as HTMLInputElement
            signalToUse.value = Number(target.value);
        }}
    />
});


export const SvgTest = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="none" viewBox="0 0 500 500"><g clip-path="url(#a)"><circle cx="250" cy="250" r="250" fill="#fff" /><path fill="#18B6F6" d="m367.87 418.45-61.17-61.18-.94.13v-.67L175.7 227.53l32.05-31.13L188.9 87.73 99.56 199.09c-15.22 15.42-18.03 40.51-7.08 59.03l55.83 93.11a46.82 46.82 0 0 0 40.73 22.81l27.65-.27 151.18 44.68Z" /><path fill="#AC7EF4" d="m401.25 196.94-12.29-22.81-6.41-11.67-2.54-4.56-.26.26-33.66-58.63a47.07 47.07 0 0 0-41.27-23.75l-29.51.8-88.01.28a47.07 47.07 0 0 0-40.33 23.34L93.4 207l95.76-119.54L314.7 226.19l-22.3 22.67 13.35 108.54.13-.26v.26h-.26l.26.27 10.42 10.2 50.62 49.78c2.13 2 5.6-.4 4.13-2.96l-31.25-61.85 54.5-101.3 1.73-2c.67-.81 1.33-1.62 1.87-2.42a46.8 46.8 0 0 0 3.34-50.18Z" /><path fill="#fff" d="M315.1 225.65 189.18 87.6l17.9 108.14L175 227l130.5 130.27-11.75-108.14 21.37-23.48Z" /></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h500v500H0z" /></clipPath></defs></svg>
)


export default component$(() => {
    const store = useStore({
        now: new Date()
    })

    useServerMount$(async () => {
        store.now = new Date();
    })

    const parentSignal = useSignal(2);
    return (
        <div>
            <SvgTest />
            <button onClick$={() => parentSignal.value = 2382882}>Change from parent</button>
            <MyComp />
            <p>{parentSignal.value}</p>
            <div class={{ "test-background": true }}>
                Hi testy testy
            </div>
            <h1>
                Welcome to Qwik <span class="lightning">⚡️</span>
            </h1>
            <p>The server last ran me at {store.now.toUTCString()}</p>
            <ul>
                <li>
                    Check out the <code>src/routes</code> directory to get started.
                </li>
                <li>
                    Add integrations with <code>npm run qwik add</code>.
                </li>
                <li>
                    More info about development in <code>README.md</code>
                </li>
            </ul>

            <h2>Commands</h2>

            <table class="commands">
                <tr>
                    <td>
                        <code>npm run dev</code>
                    </td>
                    <td>Start the dev server and watch for changes.</td>
                </tr>
                <tr>
                    <td>
                        <code>npm run preview</code>
                    </td>
                    <td>Production build and start preview server.</td>
                </tr>
                <tr>
                    <td>
                        <code>npm run build</code>
                    </td>
                    <td>Production build.</td>
                </tr>
                <tr>
                    <td>
                        <code>npm run qwik add</code>
                    </td>
                    <td>Select an integration to add.</td>
                </tr>
            </table>

            <h2>Add Integrations</h2>

            <table class="commands">
                <tr>
                    <td>
                        <code>npm run qwik add cloudflare-pages</code>
                    </td>
                    <td>
                        <a href="https://developers.cloudflare.com/pages" target="_blank">
                            Cloudflare Pages Server
                        </a>
                    </td>
                </tr>
                <tr>
                    <td>
                        <code>npm run qwik add express</code>
                    </td>
                    <td>
                        <a href="https://expressjs.com/" target="_blank">
                            Nodejs Express Server
                        </a>
                    </td>
                </tr>
                <tr>
                    <td>
                        <code>npm run qwik add netlify-edge</code>
                    </td>
                    <td>
                        <a href="https://docs.netlify.com/" target="_blank">
                            Netlify Edge Functions
                        </a>
                    </td>
                </tr>
                <tr>
                    <td>
                        <code>npm run qwik add static-node</code>
                    </td>
                    <td>
                        <a
                            href="https://qwik.builder.io/qwikcity/static-site-generation/overview/"
                            target="_blank"
                        >
                            Static Site Generation (SSG)
                        </a>
                    </td>
                </tr>
            </table>

            <h2>Community</h2>

            <ul>
                <li>
                    <span>Questions or just want to say hi? </span>
                    <a href="https://qwik.builder.io/chat" target="_blank">
                        Chat on discord!
                    </a>
                </li>
                <li>
                    <span>Follow </span>
                    <a href="https://twitter.com/QwikDev" target="_blank">
                        @QwikDev
                    </a>
                    <span> on Twitter</span>
                </li>
                <li>
                    <span>Open issues and contribute on </span>
                    <a href="https://github.com/BuilderIO/qwik" target="_blank">
                        Github
                    </a>
                </li>
                <li>
                    <span>Watch </span>
                    <a href="https://qwik.builder.io/media/" target="_blank">
                        Presentations, Podcasts, Videos, etc.
                    </a>
                </li>
            </ul>
            <Link class="mindblow" href="/flower">
                Blow my mind 🤯
            </Link>
        </div>
    );
});

export const head: DocumentHead = {
    title: 'Welcome to Qwik',
};
