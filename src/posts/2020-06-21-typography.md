---
title: "【parasiTrader】 BDD で開発を進めるメリットとは？"
date: 2020-06-21
thumb: "cat.jpg"
tags: 
    - 日本語
    - C#
---

Lid est laborum et dolorum fuga. Et harum quidem rerum facilis est et expeditasi distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihilse impedit quo minus id quod amets untra dolor amet sad. Sed ut perspser iciatis unde omnis iste natus error sit voluptatem accusantium doloremque laste. Dolores sadips ipsums sits.

Nunc tristique velit ligula. Phasellus vel massa a lorem facilisis interdum ut ac erat. Sed convallis a nisi non elementum. Vivamus ac ultricies dolor. Fusce in erat rhoncus, ultrices ante placerat, vulputate odio. Aliquam porta varius enim vitae tempus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras consectetur augue mauris, in scelerisque mauris dictum nec. Pellentesque a venenatis est. Curabitur ut quam tempus, dictum elit nec, vehicula dui. Nunc vestibulum lorem ac finibus consequat.

# Heading 1

Lid est laborum et dolorum fuga. Et harum quidem rerum facilis est et expeditasi distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihilse impedit quo minus id quod amets untra dolor amet sad. Sed ut perspser iciatis unde omnis iste natus error sit voluptatem accusantium doloremque laste. Dolores sadips ipsums sits.

<figure>
	<img src="/assets/img/test.jpg" alt="test">
	<figcaption>test</figcaption>
</figure>

## Heading 2

Lid est laborum et dolorum fuga. Et harum quidem rerum facilis est et expeditasi distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihilse impedit quo minus id quod amets untra dolor amet sad. Sed ut perspser iciatis unde omnis iste natus error sit voluptatem accusantium doloremque laste. Dolores sadips ipsums sits.

<img src="/assets/img/cat.jpg" alt="cat">

### Heading 3

Lid est laborum et dolorum fuga. Et harum quidem rerum facilis est et expeditasi distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihilse impedit quo minus id quod amets untra dolor amet sad. Sed ut perspser iciatis unde omnis iste natus error sit voluptatem accusantium doloremque laste. Dolores sadips ipsums sits.

#### Heading 4

Lid est laborum et dolorum fuga. Et harum quidem rerum facilis est et expeditasi distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihilse impedit quo minus id quod amets untra dolor amet sad. Sed ut perspser iciatis unde omnis iste natus error sit voluptatem accusantium doloremque laste. Dolores sadips ipsums sits.

##### Heading 5

Lid est laborum et dolorum fuga. Et harum quidem rerum facilis est et expeditasi distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihilse impedit quo minus id quod amets untra dolor amet sad. Sed ut perspser iciatis unde omnis iste natus error sit voluptatem accusantium doloremque laste. Dolores sadips ipsums sits.

###### Heading 6

Lid est laborum et dolorum fuga. Et harum quidem rerum facilis est et expeditasi distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihilse impedit quo minus id quod amets untra dolor amet sad. Sed ut perspser iciatis unde omnis iste natus error sit voluptatem accusantium doloremque laste. Dolores sadips ipsums sits.

## Typography

Lid est laborum et dolorum fuga, This is [an example](http://example.com/ "Title") inline link. Et harum quidem rerum facilis, **This is bold** and *emphasis* cumque nihilse impedit quo minus id quod amets untra dolor amet sad. While this is `code block()` and following is a `pre` tag


```csharp
using Prism.Mvvm;
using Reactive.Bindings;
using Reactive.Bindings.Extensions;
using SpikePrism.Application;
using SpikePrism.Domain;
using System;

namespace SpikePrism.WPF.ViewModels
{
    public class CalculatorViewModel : BindableBase
    {
        private readonly CalculatorApplicationService _calculatorApplicationService;

        public ReactiveCommand RunCommand { get; }
        public ReactiveCommand CancelCommand { get; }
        public ReactiveProperty<int> Result { get; }

        public CalculatorViewModel(CalculatorApplicationService calculatorApplicationService)
        {
            _calculatorApplicationService = calculatorApplicationService;

            Calculator calculator = _calculatorApplicationService.NewCalculator();
            RunCommand = new ReactiveCommand().WithSubscribe(() => _calculatorApplicationService.Run(calculator));
            CancelCommand = new ReactiveCommand().WithSubscribe(() => _calculatorApplicationService.Cancel(calculator));

            Result = calculator.ToReactivePropertyAsSynchronized(x => x.Result);
        }
    }
}
```

This is blockquote, Will make it *better now*

> 'I want to do with you what spring does with the cherry trees.' ~ Pablo Neruda

> Et harum quidem *rerum facilis* est et expeditasi distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihilse impedit

Unordered list

*   Red
*   Green
*   Blue

Ordered list

1. **Red**: this is bold test.
    1. Green
    1. Yellow
1.  Blue

## Tables

Tables aren't part of the core Markdown spec, but we supports supports them out-of-the-box.

| Name 	| Age 	|
| ----- | ----- |
| Bob	| 27	|
| Alice | 23	|

Inline Markdown within tables

| Inline     | Markdown  | In                | Table      |
| ---------- | --------- | ----------------- | ---------- |
| *italics*  | **bold**  | ~~strikethrough~~ | `code`     |