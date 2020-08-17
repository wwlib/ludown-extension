### ludown textmate grammar notes

#### comments

(^>)(.*)(?<=$)

```
> ansndlskdflksdnfsdfnds
> sldkjlskdfj sdflkjsdf
> - {C=c}.
```

#### samples

(^- )(.*)(?<=$)

```
- {A={B=c}}.
```

#### annotations

({)([_A-Z]+)=([ .'a-zA-Z]+)(})

```
{B=c}
{ENTITY=mr. d'roboto}
```