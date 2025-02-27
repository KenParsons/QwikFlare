import { test } from 'uvu';
import { equal } from 'uvu/assert';
import { getPathnameForDynamicRoute, isSameOriginUrl, normalizePathname } from './pathname';
import type { PathParams } from '../runtime/src/library/types';
import { parseRoutePathname } from '../buildtime/routing/parse-pathname';

test('isSameOriginUrl', () => {
  const t = [
    { url: '#hash', expect: false },
    { url: '   #hash', expect: false },
    { url: '', expect: false },
    { url: '    ', expect: false },
    { url: 'javascript://nice', expect: false },
    { url: 'file://local', expect: false },
    { url: 'about://blank', expect: false },
    { url: 'HTTPS://qwik.builder.io', expect: false },
    { url: 'http://qwik.builder.io', expect: false },
    { url: 'relative:whatever', expect: true },
    { url: 'relative', expect: true },
    { url: './relative', expect: true },
    { url: '/absolute', expect: true },
    { url: undefined, expect: false },
    { url: null, expect: false },
  ];
  t.forEach((c) => {
    equal(isSameOriginUrl(c.url!), c.expect, c.url!);
  });
});

test('normalizePathname', () => {
  const tests = [
    {
      pathname: '/name/',
      basePathname: '/',
      trailingSlash: true,
      expect: '/name/',
    },
    {
      pathname: '/name',
      basePathname: '/',
      trailingSlash: true,
      expect: '/name/',
    },
    {
      pathname: '/name/',
      basePathname: '/',
      trailingSlash: false,
      expect: '/name',
    },
    {
      pathname: '/name',
      basePathname: '/',
      trailingSlash: false,
      expect: '/name',
    },
    {
      pathname: 'plz no spaces',
      basePathname: '/',
      trailingSlash: false,
      expect: '/plz%20no%20spaces',
    },
    {
      pathname: './about',
      basePathname: '/',
      trailingSlash: false,
      expect: '/about',
    },
    {
      pathname: '/about.html',
      basePathname: '/site/',
      trailingSlash: true,
      expect: '/site/about.html',
    },
    {
      pathname: '/about.html',
      basePathname: '/site/',
      trailingSlash: false,
      expect: '/site/about.html',
    },
    {
      pathname: '/about',
      basePathname: '/site/',
      trailingSlash: true,
      expect: '/site/about/',
    },
    {
      pathname: '/about/',
      basePathname: '/site/',
      trailingSlash: false,
      expect: '/site/about',
    },
    {
      pathname: '/',
      basePathname: '/site/',
      trailingSlash: true,
      expect: '/site/',
    },
    {
      pathname: '/',
      basePathname: '/site/',
      trailingSlash: false,
      expect: '/site/',
    },
    {
      pathname: '/',
      basePathname: '/',
      trailingSlash: true,
      expect: '/',
    },
    {
      pathname: '/',
      basePathname: '/',
      trailingSlash: false,
      expect: '/',
    },
  ];

  tests.forEach((t) => {
    const pathname = normalizePathname(t.pathname, t.basePathname, t.trailingSlash);
    equal(pathname, t.expect);
  });
});

test('dynamic, rest pathname in segment', () => {
  const p = getPathname({
    originalPathname: '/blog/start-[...slugId]-end',
    params: {
      slugId: 'what-is-resumability',
    },
  });
  equal(p, '/blog/start-what-is-resumability-end');
});

test('dynamic rest pathname', () => {
  const p = getPathname({
    originalPathname: '/blog/[...slugId]',
    params: {
      slugId: 'what-is-resumability',
    },
  });
  equal(p, '/blog/what-is-resumability');
});

test('dynamic, empty rest pathname in root', () => {
  const p = getPathname({
    originalPathname: '/[...id]',
    params: {
      id: '',
    },
  });
  equal(p, '/');
});

test('dynamic, empty rest pathname in root with nested page', () => {
  const p = getPathname({
    originalPathname: '/[...id]/page',
    params: {
      id: '',
    },
  });
  equal(p, '/page');
});

test('dynamic pathname', () => {
  const p = getPathname({
    originalPathname: '/docs/[category]/[slugId]',
    params: {
      category: 'introduction',
      slugId: 'basics',
    },
  });
  equal(p, '/docs/introduction/basics');
});

function getPathname(t: { originalPathname: string; params?: PathParams }) {
  const p = parseRoutePathname(t.originalPathname);
  const d = getPathnameForDynamicRoute(t.originalPathname, p.paramNames, t.params);
  return normalizePathname(d, '/', false);
}

test.run();
