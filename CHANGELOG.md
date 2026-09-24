# v1.4.65
- Fix: Solved multiple hardcoded texts and colors. 
- Update: Upgraded validate-theme.js utility with new features like scan specific files or analyze a diff file. Also, it reports suspicious lines and can be added to an ignore list with a click. Now we enabled the detection of hardcoded colors and texts.
- Update: Theme massively updated by IA generated scripts to fix different issues that don't follow our standards.
- Update: Discount code input field in cart page and side cart is now part of the UNO-Pro theme, instead of being bundled with the GWP add-on because Horizon theme comes with this feature included.


# v1.3.64
stores: https://efbjtp-t1.myshopify.com

- Fix: correction of liquid variables that pointed to "Color scheme 1". Used to be {{settings.scheme_1_buttons}} and now {{settings.color_schemes['scheme-1'].settings.buttons_background}}.
- Fix: Blocks 'Slider', 'Image' and 'Video' where using section.settings instead of block.settings, ignoring visibility_if conditions.
- Fix: Added 'ignores' configuration for OrphanedSnippet check, as it started throwing issues for some snippets that might be used in the future.
- Fix: Added 'left: 0' css to expandable quick add panel, because it was incorrectly aligned in theme blocks.
- Fix: When clicking the add to cart button of the Products Carousel block in Product Main section, it was also triggering the add to cart of the main product at the same time. Then sometimes the main product was the only item being added to cart. The issue was happening when the Products Carousel is placed above the 'Add' button.
- Update: Removed 'Bottom sections group' because it doesn't make sense now that 'Footer' is also a section group.
- New: Added 'Navigation Bar' section. Displays links with image and/or text, without lazy loading when above the fold, supports image or text separators. Has overflow for bleeding effect, and shadow on the screen edges until reaching the end of the scrollable container; page scope (home/core/all), mobile-only/mobile-desktop visibility, optional top/bottom borders, and a toggle for the scroll-edge shadow. **Important: this should be added in the 'top sections group' instead of the header group because its content is not really part of the header and not accounted for full height banners and top sticky elements like the PLP filters bar.**
- New: There is a new group of settings in Theme Settings -&gt; Section Groups to show or hide the optional section groups: Announcement, Top, Bottom. This allows the admin to enable section groups only if needed.
- New: The block Products Carousel in the PDP (product_main) now supports different 'list' and 'carousel' layouts, and there are settings to change the product card design (e.g., price position, quickview vs add to cart button with variant dropdown). Card and Image border radius are inherited from global product cards settings, and the image height is also inherited the same way.
- New: The mobile menu can include Featured Collections carousels. They appear below the links after other custom elements like banners, buttons, etc. Important: they can't appear between other elements like links and banners due to the way they are structured.
- New: The mobile menu now supports tabs. It can hold multiple tabs, each with its own menus, submenus and custom elements like banners, buttons, etc.


# v1.3.63
stores: https://swan-island-dahlias.myshopify.com/

- Fix: Removed obsolete asset/checkout.css.liquid file.
- Fix: Bundle items (_bundle_positions) count was including individual items, then bundles.js validation was removing the main and related items because their count is different than the _bundles_positions value. This value must not include individual items as they don't have to be handled as a bundle. 
- Fix: Updated the $s.getItemsToUpdate function to exclude individual items when removing a main or related product.
- Fix: Added role="img" to ratings div, because Lighthouse was reporting an invalid aria-label attribute on the div.
- Fix: Solved issue with header that remain transparent. Discovered in Free Rein rebuild: When Header Style section is active, if you scroll down the page then reload, the header loads transparent and then it stays transparent even if you scroll up and then down, until the position the scroll was set during the page load.
- Fix: Product data JSON-LD was printing `shop.currency` instead of the customer currency, so crawlers in context of other markets were pulling incorrect prices.
- Update: Side cart and cart page additional checkout buttons now load once and then the content doesn't update until page reloads. This is to improve performance on cart updates because reloading the buttons causes between 25 and 30 requests more. This issue started happening since version v1.3.55.
- Update: Performance improvement. In sections where the image takes much of the horizontal space, like banners and also including the product gallery, the image tags generated without lazy sizes now use the `image_tag` filter with `preload:true` attribute. This makes Shopify to add a preload referencing the image to the page headers, which noticeable improves the priority of the main image loaded above the fold.
- Update: Removed totalSavings calculation that was including compare_at_price vs
 price differences, which doesn't match the value displayed at checkout. Now it shows `cart.total_discount`. Also we can now use the liquid `render` tag instead of the `include`.
- Update: Performance improvement. Now the additional checkout buttons in the side cart load on demand, when the user opens the cart and it contains items. This reduces network requests by ~50, resource transfers by ~130KB, and eliminates those resources processing while not needed.


# v1.3.62
stores: https://fj028n-yp.myshopify.com/ (Dessy), https://nassifskincare.myshopify.com/, https://free-rein-coffee.myshopify.com/
- Fix: Collection card title's font size was affected by the setting of the article cards instead of the corresponding setting.


# v1.3.61
stores: https://dibs-usa.myshopify.com

- Fix: Many setting labels were 'Letter Spacing' instead of 'Letter spacing', and did not follow a consistent naming format.
- Fix: Testimonial section setting 'Ratings/Stars color' was causing the theme to show transparent stars after clearing a color value with the customizer.
- Fix: custom_items_content line 72: {% if block.settings.image %} --> !=blank was missing.
- Update: The sections "Image + Text (Tabs)" and "Richtext (Tabs)" now disappear when there are no tabs to show. This is helpful on the PDPs where the content is connected with Metafields (if a product doesn't have the Metafield, now the section doesn't show).
- Update: Footer grid gaps were hardcoded in the .grid and .grid-item instead of just editing the css variable --grid-gap.
- Update: Now there's a Theme Setting for the typographies font-smoothing (antialiasing) and upcase numbers (lnum) instead of applying it by default.
- Update: Now the titles, eyebrow and text of the timeline blocks can be styled (similar to the titles and text of the Info Cards).
- Update: Added global function fetchSectionByIds and used it to load more than 5 megamenus in chunks of 5 sections per request.
- New: Block for Products Carousel in the PDP (product_main). Helpful for "Combine it with". Can be connected with a Metafield of products list.
- New: Ability to add a "prefix text" to the Scrolling Text (marquee) section, acting as a title for the section.


# v1.3.60
stores: https://bldgactive.myshopify.com, https://just-bagels.myshopify.com

- Fix: Icons inside a form field now use the variable --scheme-fields-label-color instead of --scheme-icons-color (it created legibility issues depending on the colors selected).
- Fix: The accordions in the Theme Blocks section didn't have a border because there was a border: none applied to all the .accordion:last-child (and in Theme Blocks each one is wrapped in a grid-item, so they are always a last-child). Fixed by adding :not(.grid-item) > .accordion:last-child to that line.
- Fix: Undefined variable input_id in cart_item.liquid. Not detected by theme check for unknown reason.
- Update: Truncated the Product and Article titles in the breadcrumbs: limit 7 words.
- Update: Added the class "active" to the active links of the simple_link snippet. No specific style was added, it could be used if needed.
- Update: Now when the theme has 'Use variant images as swatches' enabled, the swatches background color is clipped to exclude the semitransparent borders, avoiding swatches to look with different border color.


# v1.3.59
stores: https://donco1.myshopify.com, https://playa-beauty-store.myshopify.com, https://shoplittletrouble.myshopify.com, https://babo-botanicals.myshopify.com, https://maple-leaf-farms-store.myshopify.com 

- Fix: Header main menu had negative margin of -1em instead of 1.5rem to compensate the padding of the links (1.5rem).
- Fix: Header's border bottom was in conflict with the menu bar when the menu goes under the header.
- Fix: Top utils didn't have justify-content-center (noticeable when the labels go under the icons).
- Fix: The menu-bottom of the header (when it's under the logo) didn't hide on Mobile. Added the class medium-down--hide.
- Fix: The back link on the Article Head Section wasn't getting aligned with the text-align feature of the section.
- Fix: The "shop now" fake button of the normal product-cards had a z-index higher than the 'a' tag with the link, so nothing happened when you clicked on it.
- Fix: The logo svg color on the header_style section needed another validation to check if it's != blank.
- Fix: Article card option to "open in new tab" wasn't working because the html was in the wrong place.
- Update: the icons of the floating buttons don't change the color on hover anymore, it caused issues with certain color schemes.
- Update: Contact Main now has a width: 100%; (it had a max-width).
- New: Info Cards and Testimonials sections: now the size of the image of the cards can be edited for Desktop and Mobile independently.
- New: The Mobile Menu has its own color scheme settings (there are several designs where the mobile menu has different colors than the cart).
- New: Scrolling Text section (marquee) now has more settings for the text style, and also can be set up as non-full-width and with border radius (useful for some designs).
- New: The Testimonials section now has a setting to change the color of the stars (by default it uses the text color of the scheme, but sometimes they want them in yellow).
- New: Added flex-direction-column to the product cards so it's easier to manage the position of some elements.
- New: Accordion section now allows adding an image/icon next to the title of each accordion (we already did that for the Accordion block of the Richtext Blocks).
- New: The height of the image of the cards (Product, Collection and Article) can be edited with a range input instead of selecting between 3 options.


# v1.3.58
stores: https://8wr1nj-1e.myshopify.com (warrior-poet-society)

- Fix: Change on validate-theme.js JSON comments parser as it was breaking with urls inside the JSON.


# v1.3.57
stores: https://geniusshot.myshopify.com,  https://b7tmhw-2j.myshopify.com (Schneiders)

- Fix: Solved header and mobile menu links for multilanguage scenario where the link url '#' was not considering the language prefix, then generating a link instead of a button with an url like `en/#`.
- Fix: Added a `display: block` to the product-gallery element in the PDP, that way it shows with the correct width while the page loads. Previously there was some sort of reflow when the keen class gets added to the element, causing something to execute a lot of javascript code, negatively affecting the Lighthouse score.
- Fix: The product card callouts now apply the content alignment to match with the other elements. Previously they were always aligned to the left.
- Fix: The "Color swatches always visible" setting was hidden incorrectly when the quick shop setting was set to false, because this setting also applies to normal product cards.
- Fix: Validation checkJsonCustomCss was failing because Shopify automatically generated comments in json templates can't be parsed when using JSON.parse().
- Fix: `info_cards` block for richtext sections had the wrong variable for the titles letter_spacing, so it wasn't working.
- Fix: Page Hero sections: Position-relative was on .content-wrapper but had to go on .content.
- Fix: The custom_utils had the html/liquid ready to be hidden on Mobile, but the Setting was missing on the schema.
- Update: Announcement bar text can be more customized: font-family, font-weight, text-transform, letter-spacing.
- Update: Special style for the bar that separates the numbers in the keen slider counter.
- Update: Product price in product cards atc is no longer using flex column, because when the strikedthrough price appeared it was pushing color swatches down and causing missalignment with colors in other cards.
- New: Added layout option to show vertical thumbnails in the product gallery on Mobile.
- New: Added layout option to show only the main carousel in the product gallery on Mobile. It also allows adjusting how much of the next item to show.
- New: Added setting "Color swatches quantity limit"in Theme Settings-&gt;Product cards. When the limit is other than 0, it displays up to the specified number of swatches and then '+N more' if there are remaining swatches for that product card. Works for both normal and quick add product cards.
- New: Added setting "Bottom content alignment" in Theme Settings-&gt;Product cards. It only applies to quick shop product cards. The value 'Bottom' could be useful in very specific situations, e.g. when titles length vary too much but the rest of the cards (callouts + swatches) is pretty uniform. Otherwise 'Top' combined with Match of title height is recommended.
- New: Added global container padding settings to `settings_schema` so it can be edited.
- New: Added the block "Separator" to the Page Hero sections.
- New: Added option to hide the search and user links from the top_utils on Mobile.


# v1.3.56
stores: https://matt-bernstein-merch.myshopify.com

- Fix: The price of the product cards was aligned to the right in the "list" mode layout. Now it is on the left like the other content.
- New: Added product callouts to product cards. It can be enabled in Theme Settings-&gt;Product Cards-&gt;Callouts, and has a few styling options like font size, typography and border radius. It pulls callout label, background color and image from metaobjects asigned to the product through a product metafield. This metaobject and metafield definition will need to be manually created in client stores.
- New: Added setting 'Swatches position' to place product card color swatches above the product title. It only works when the site has quick shop disabled because on quick shop product cards it would be possible to see the swatches above the title and in the quick shop panel at the same time and it wouldn't look good.
- New: Added settings 'Border radius' in Theme Settings-&gt;Products-&gt;Variant selection. These allows to customize the border radius of color swatches and label swatches. The border radius applies to PDP main section and product cards replicating the scale of the border.


# v1.3.55

- Fix: Added `aria-hidden` to the fake SHOP NOW product card button. Pull text copy from `product_card` instead of `product_card_atc`. **Important** Added to `ignore-slide-tabindex` to prevent keenslider from setting tabindex=0 in carousels.
- Fix: Added missing `, allow_false: true` to `default` filter on boolean variables.
- Fix: GWP addon was considering as out of stock gwp items that don't have inventory tracking because the `inventory_policy` is `deny` by default, and the addon was expecting `continue`. This issue is present in all integrations of the GWP addon since v1.0.20.
- Fix: Photoswipe icons were not visible or had a very dark color similar to the background.
- Fix: Closing Photoswipe opens the side cart when the icons overlap.
- Fix: The workaround to load the PDP main image without lazy loading broke on version v1.3.52.
- Fix: Solve product card inputs that were generating without `tabindex="-1"` in product cards with `aria-hidden="true"`.
- Fix: Solve accessibility issue with dots of carousel, causing clickable size to be too small or overlapped.
- Fix: Solve accessibility with missing label on delivery frequency dropdown. Change text to be pulled from data- attributes, instead of printing directly into product_main.js from theme settings because it doesn't work on multi-language environment as the file compilation doesn't depend on user's language.
- Fix: 'Title size' setting in accordion blocks was printing `p0` for the first size but this style doesn't exist. Increased the setting value by 1 so it prints p1, p2 or p3 instead.
- Fix: Removed the `visible_if` of the text and title size settings. Moved them to a new 'Text Style' group of settings.
- Fix: The customizer option for the padding botton was not applying for mobile on the Grid / Slider block in the Theme blocks section.
- Fix: Keen dots, when they are "line", container's width and margins were not correct, because they were inheriting negative margins used to align dots.
- Fix: Padding right on product title incorrectly applied when there is no 'floating badges' module. Now, when floating badges is enabled, the first div has padding right, regardless of the module type (vendor, breadcrumb, title). Also added a badges limit setting, 1 by default, and could be increased considering the layout of the badges (for example horizontally and not floating).
- Fix: Fix obsolete negative margin on .section-grid grid, which now uses row-gap to separate items. The issue was happening because the bottom margin on the .section-grid .grid-item that compensate the negative margin was changed to 0.
- Fix: In the Header Style section, fixed the alternate logos for desktop and mobile that were injecting outside the link tag and without any accessibility consideration.
- Fix: Lazy loaded video posters now pull an image that matches the video tag width multiplied by device pixel ratio, instead of a fixed 4100px width.
- Fix: Mega menus now have a `max-height` and `overflow-y: auto`, allowing users to scroll tall panels that would otherwise overflow the viewport and prevent access to the content at the bottom.
- Fix: Style `.slide-in-modal .close` was affecting buttons with class `.close` that are not related to the close button of the modal. For example the close button of the quick shop panel in featured product cards.
- Fix: Settings cart_custom_text1 and cart_custom_text2 had an incorrect visible_if condition, so they were not appearing.
- Fix: Bundle builder sticky panels had a wrong z-index and also let the user see the box-shadow of swatches below.
- Update: Improved cart/side cart to not load additional checkout buttons when cart is empty. Such buttons load huge quantity of code.
- Update: Removed Account Popup feature.
- Update: Header Style section's warning now indicates that the section must be the 2nd in the template for optimal LCP & CLS.
- Update: Header logo image `width` filter reduced from 600 to 400, while considering device pixel ratio, and that logos are mostly SVG files.
- Update: Changed class names in all sections from `type_Something` to `type-something`. That way allows to use the classes in css files without triggering a `checkCssClassNaming` error. Also updated other class names that appear in the theme. Photoswipe css excluded from the check.
- Update: Now subscriptions widget works with merged products. **Note: All merged products must still have the same 'requires selling plan' setup.**
- New: Added custom theme checks to enforce development standards on pushed code. **Documentation pending**.
    - `checkCssClassNaming`: should match allowed format 'media--class-name'.
    - `checkConsoleDebug`: doesn't allow 'debugger' statement, neither console.log or console.debug.
    - `checkFontFamily`: look for hardcoded font-family css.
    - `checkJsonCustomCss`: looks for hex colors and hardcoded font-family inside `custom_css` values.
    - `checkHardcodedText`: looks for hardcoded text that should be translatable.
- New: Functionality to show reviews rating pulling from Shopify native reviews.rating metafield. Optimized to reduce the html size.
- New: Globally added "Blur effect size" setting to **Text protection** background.
- New: Now carousels with dots styled as lines can show the slide number and total slides on the right (e.g. "---------- 03/10"). Enable this with the new setting 'Show slider pages' in Theme Settings -> Carousels.
- New: Theme blocks Container element now has a "Positioning: Default/Absolute/Sticky" setting, replacing the old "Postion absolute?" checkbbox. When sticky, the container is rendered with a &lt;sticky-updown&gt; component instead of a &lt;div&gt;. This allows building a 2 column layout where one of the sides remains sticky, like the PDP main section. The container now also has options to reverse the direction of the elements on desktop or mobile, allowing to have the sticky panel first and the normal container second for mobile, but view the sticky container on the right on desktop.


# v1.3.54
stores: https://cbdfx-us.myshopify.com

- Fix: Added/fixed the Eyebrow size on the Collage and Timeline sections.
- Fix: Fixed case of some setting labels: Media Height, Media Position Media Width.
- Fix: Styling of price in product cards where there was missing gap with the product title and the Text Align=Left mode was making the title column too narrow when the compare at price was visible. Now in that align mode, the prices stack vertically.
- Update: Now the quick shop button automatically triggers the add to cart click when the options panel doesn't contain any interactive control, instead of opening the panel. This should also work with 3rd party subscription widgets that could be added to the product card dynamically.
- New: Added option "Add to cart / Shop now" to CTA Style setting of product cards. For normal product cards, this option creates a "Shop now" fake CTA while the product card link remains as is. For quick shop product cards, the quick shop floating button is replaced by a button with label "Add to cart" but it still opens the options panel if it contains interactive controls. This button shows 'Sold out' when all product variants are unavailable, which works for the Custom Product Merge and Combined Listing functionalities.


# v1.3.53
stores: https://shiaqgaessentials.myshopify.com, https://malo-international.myshopify.com

- Fix: In PLP filters, padding was removed by error for the last item's title when the 'Filter group border position' setting is set to 'Below title'.
- Fix: Featured ... sections were overwriting tab font size setting.
- Fix: Text and icons color wasn't working on the Before & After section. Also added the alpha parameter to that color input.
- Fix: Section_multi_item_structure head with button on right-side had issues on Tablet and Mobile. Added medium-down--flex-wrap and row-gap: 1.5em to the head element on Tablet and Mobile.
- Fix: Added `.product-tabs` class selector to Featured Products (Tabs) section's inline css rules that were affecting other multi-item sections.
- Fix: Removed conditional setting ("visible_if") to the Width Desktop and Width Mobile settings of all sections that support carousel and grid layouts. These settings apply to both layouts but were showing for carousels only.
- Fix: The "Line tabs full width" setting in Featured Products (Tabs) section was also visible when the style was 'Pills'.
- Fix: In theme blocks containers that are absolute positioned and with direction: column, when the content doesn't fit in, it now wraps vertically instead of horizontally. In that case, only that section looks broken instead adding content horizontally that breaks multiple things in the page.
- Fix: Multi-item sections in full width layout now show content with padding left and right so it doesn't get to edge of the viewport.
- Fix: Modified the styling of product price in product cards because it was overflowing on full width layouts.
- Update: Added collection/article cards title size setting.
- Update: Compact Banner section settings updated (added Decorative Floating Image block, and moved some other things around for consistency).
- Update: Added media_position_mobile and border_radius_mobile settings to the Before & After section.
- Update: Image blocks in Richtext and Theme blocks sections now show a placeholder when the image is not picked yet. This way the background image in theme blocks banner layout is noticeable.
- Update: Added advanced css rules to target a theme block structure where the image is a background image or video with an absolute positioned container so it appears center and respects object-position css (image only). This allows you to create a banner with a background image and the content determines the size of the container.
- New: Add in cart subscription options with bundle handling, disabling subscription options not valid for all items in the bundle.
- New: **Setting "Disable quick shop on Homepage" (true by default)** to disable quick shop in the Homepage but leaving it enabled for all other pages in the site. Homepages with many product cards will have a better performance when using the normal product cards.
- New: New settings for the title size and weight in all the product/collection/article cards. New setting to align the title and other elements of the cards to the left/center/right.
- New: **Added category and presets to Theme blocks** for a clearer organization. Now there is a 'Templates' category of presets with a few common layouts that are difficult to build. Also configured blocks visibility, e.g. Product Cards can only be added inside Grid/Slider blocks. 
- Fix: Hero Carousel's main settings had visible_if with block instead of section.

**Shopify Feature: Naming blocks with an underscore preffix makes them visible only when explicitly allowed inside a block schema definition.**


# v1.3.52
stores: https://jshtwd-hc.myshopify.com, https://oklahoma-joes-1.myshopify.com

- Fix: Fixed discount code condition broken in GWP add-on at frontend.
- Fix: The box-sizing value of containers that should depend on the theme blocks setting was overridden by a more specific CSS rule.
- Fix: An empty rectangle appeared when focusing on the search embed input.
- Fix: Added missing space character after fetchpriority="high" attribute.
- Update: All product cards have an instance counter so they don't repeat element IDs when a product is in the same section twice, or when the same section ID is repeated in the page because multiple copies were obtained for Combined Listing products.
- Update: Cart items now disable or remove the quantity and remove controls based on shopify new item properties **instructions.can_update_quantity** and **instructions.can_remove**.
- New: 'Conditional Settings' added throughout the Customizer.
- New: Added built-in support for 'Product Merge' in PDPs and product cards (optional). Located at Theme Settings -&gt; Product Combined / Merged.
- New: Added basic support for Combined Listing app. The theme can handle product combinations  made of **1 option** that defines the product. **Multiple additional options not supported yet.** It can work with redirects to the corresponding PDP, or it can pull other PDPs sections and show the ones of the selected product while the others remain hidden. Located at Theme Settings -&gt; Product Combined / Merged.
- Update: adjustments to decorative_image richtext block.
- Update: removed the "list" richtext block (it's redundant now that the Richtext field has lists out of the box).
- New: in the Customizer, changed the "color_background" input fields (that allow gradient), with "color" fields with "alpha": true, in the cases where we used the first gradient point for colors that required transparency. Added the ALPHA property to other elements like "tabs" and "badges".


# v1.2.51
stores: https://charbroil-1.myshopify.com

- Fix: Our Search and PLP filters were breaking when the setting "Empty values" is set to "Hide" in the Search & Discovery app configuration. In that case applying a filter that makes dissapear filter group was making our code to process old and new accordions with different number of elements. This was identified in the Pink Lily store.
- Fix: Settings of the Image theme block were not working. Added missing css for the 'width', 'border radius', and content alignment should be inheriting from the container.
- Update: Tweaked lazy_src.liquid for Lighthouse score optimization and removed small_image and medium_image logic.
- Update: Added fetchpriority="high" to all &lt;img&gt; tags when the disableLazysizes is true.


# v1.2.50
stores: https://bad-ass-coffee-store.myshopify.com

- Fix: Image blocks where using Desktop size for Mobile, ignoring mobile setting.
- Fix: Theme block containers were applying Desktop width on Mobile due to a css selector with higher specificity.
- Fix: Bundle builder now includes product_main.js through snippet that defines lngg variables.
- Fix: Sticky updown in PDP, content was getting behind the header when it is configured as "Shows on scroll".
- Fix: Slight performance tweaks.
- Update: Multi-item sections where not using width settings on Grid mode. They were always using 'container' for Desktop and 'left' for mobile. Now they are affected by width settings. Also the mobile setting default value was changed from 'full' to 'left' to match the previous usage. This affects carousels on mobile that now appear with the bleeding effect instead of centered.
- Update: Added css variable `--header-offset-scroll-up`, useful when using header in "Shows on scroll" or "Sticky" modes where this value will be the same as the `--header-height`, while on "Static" mode it will be equal to the `--header-offset` (zero).


# v1.2.49
stores: https://pinklilyboutique.myshopify.com, https://saintcroixinc.myshopify.com

- Fix: A comment was saying 'look for loadSideCart' instead of 'look for loadMegaMenu'.
- Fix: Bundle builder 'Remove item' button was showing a liquid error.
- Fix: Moved multiple hardcoded 'Original price' and 'Final price' labels to json locales.
- Fix: Hero Banner was doing lazy loading even when it was the first section because the validation only worked for the hero carousel.
- Fix: Product main js was included twice when quick add was enabled due to a wrong setting check.
- Fix: The SVG (arrow-down) of the select fields was above the &lt;select&gt; element, therefore when you clicked on the arrow nothing happened. Changed the z-index to fix it.
- Fix: Removed some icons that were specific for a client (dog, cat, feeding-bowl) from the list of icons in the settings of Mobile Menu and Product Main (accordions). 
- Fix: Added the word 'From' (from the prices on the product cards) to Languages ('product_card_atc.starts_at_price').
- Update: Changed some colors from the default color schemes for ADA compliance.
- Fix: Missing (Desktop) and (Mobile) distinction in some Width labels on the page_hero sections.
- Fix: Carousels of multi-items sections: when the text/icons are set to be center-aligned, and there are less items than items-per-page, the slides will be centered too (to match the alignment of the title).
- Fix: Recently viewed section was missing the "Products limit" range input (it was in the html and the script, but not in the schema).
- Update: Hero Carousel, now we can edit the size of the eyebrow.
- Update: Added the Twitter sharing link back, proved to work.
- Update: Reorganized static sections (announcement, header, footer) into section groups to support dynamic customization on per market.
- New: Added setting 'SEO -> Reviews Source' to add the aggregateRating schema depending on the app used by the store.
- New: PDP blocks: Added the ability to hide/show the blocks in the Quick View modal (class '.hide-quickview' + setting in the customizer).
- New: Added new icons: a gift box ('gift') and a pencil with a paper ('edit-paper').


# v1.2.48
stores: https://wetbrushbbi.myshopify.com, https://strivectin.myshopify.com

- Fix: 'container' Block css variable --box-sizing was not being set correctly.
- Fix: Many conditions where using `settings.link_arrow`, but always evaluating to false because the correct is `settings.links_arrow`.
- New: Added 'threads' (another Meta's social network) icon to 'icons' snippet.


# v1.2.47
stores: https://evolutionofsmooth.myshopify.com, https://musclefeast.myshopify.com

- Fix: Scrolling text section, block icon's color was not applied so the icon was not visible.
- Fix: Missing label of dropdown in customer portal mobile menu.
- Fix: Tracking links not working in orders page and wrong aria attributes.
- Fix: In Order Details page removed link to current page on tracking numbers that don't have a tracking url.
- Fix: Videos in richtext section and theme blocks not working when height is in percentage like 56.25% (option: keep aspect ratio).


# v1.2.46
stores: https://ouidadhair.myshopify.com

- Fix: Replacing [br] now includes aria-hidden="true" attribute because screen readers were stopping on the &lt;br&gt; element, and reading titles was consusing.
- Fix: Announcement bar section styles were not applying due to unexpected issues. Replaced the selector to fix the problem. Also, a closing curly bracket was missing.
- Fix: Dropdown arrows in &lt;product-dropdown&gt; component where not visible because they needed class="stroke". Fixed other SVGs too.
- Update: Now Account popup is disabled by default.
- Update: Now header items that act as link and submenu triggers are built as separate items. The text has the link, the chevron is the submenu trigger button. This fixes an accessibility issue because links can't have aria-expanded attributes.
- Update: Changed default value of suggested search terms to a placeholder instead.
- Update: Discount code applied is now pulled from cart.discount_allocations, which includes order and product discounts.


# v1.2.45
stores: https://ark-jewelry-1.myshopify.com, https://locklaces1.myshopify.com

- Fix: Bundle builder X (remove) icon broken since v1.2.44.
- Fix: Pagination accessibility had errors and was confusing.
- Fix: Verify that 'reportValidity' function exists before trying to use it because in LePrunier someone added a couple of iframes (from apps), and there was a javascript error when the function doesn't exist, which then prevents users from adding to cart.
- Update: Added improvement to Hero Banner's LCP  metric by hidding images but one when using a carousel.
- Update: Background section containing a video or iframe (external video) now loads its content in defer mode, when the section is close to the viewport area.
- New: Added a 'Deferred App or Content' Theme Block, that appears as a new type of section in the customizer. App blocks should be added inside this container instead of directly as a classic section. This new feature makes the app to load when the user scroll position is near the section or can be configured to load after the Page Load event.


# v1.2.44
stores: https://campsnapcamera.myshopify.com

- Fix: Header: logo hyperlink was stretching in certain header layouts due to the lack of a div wrapper.
- Fix: Header: missing display: block for the logo SVG.
- Fix: spacing of the badges in the PDP.
- Fix: CartDiscountCode functionality that it was not considering Amount of Order discounts.
- Update: replaced Twitter logo with X logo.
- Update: removed the Twitter sharing link from PDP and Articles (it didn't work anymore).
- Update: changed the way that the stroke and fill colors are attributed to the svg.icon elements (the icons in our library). Now we use the variable var(--scheme-icons-color). So now the svgs added by other apps or other custom svgs like the logo in the header and footer are not affected.
- Update: Footer: moved the Logo from its own Block to the "Mixed Content" Block, so it can be combined with Text and social links.
- Update: Added improvement to PDP's CLS metric by hidding images but one, also trying to load the default image faster.
- New: Footer: added SVG logo option.


# v1.2.43
stores: https://pets-know-best.myshopify.com, https://8risp5-qe.myshopify.com (Spiritual Therapy Center)

- Fix: Recommended Products section showing only 1 product when using normal product cards.


# v1.2.42
stores: https://74q7rm-ux.myshopify.com (BariLife)

- Fix: lazy_src: an image of 600px was being printed for the 300 size.
- Fix: Center alignment back to how it was before v1.2.39, there were some pros of doing it, but also a few cons that I didn't consider. It can be done on a one-off basis when needed.
- Fix: Chevron in header items where using a transition animation on hover, because only the 'color' property was animated.
- Fix: Parameter name was left with old format and not working, image_link had to be imageLink in mobile_menu.liquid.
- Fix: Normal product cards swatches were showing variant images ignoring the setting, and showing a failed image if the variant has no feature image assigned.
- Fix: Bundle builder joined progress bar was showing a gap between steps.
- Update: Section_multi_item_structure added the link arrow/chevron to the CTA that was missing (if shows if enabled for the Links in the Theme Settings).
- Update: Now product and article titles match height feature also work on the Search page.
- New: Added autoplay options for PDP videos


# v1.2.41
- Fix: $s.toCartCurrency formula was incorrect, causing important errors on values calculated. This critically affects our multicurrency support on custom features like the GWP addon, &lt;user-money&gt; component and the "Free shipping" progress bar.


# v1.2.40
stores: https://1c0baa-e3.myshopify.com (drink.love)

- Fix: The title style on the Info-Cards new Block of the Richtext Blocks wasn't working properly.
- Fix: Glitch on header when scrolling down slowly from the top of the page, caused by the Header Styles section when the setting "Change colors back to the original on scroll" is set to false.


# v1.2.39
stores: https://pipettebaby.myshopify.com (redesign), https://supreme-silent-sports.myshopify.com

- Fix: Hyperlinks within Lists were not inheriting the same styles as hyperlinks within Paragraphs.
- Fix: Small fix for the Head-Left styles on the custom_section_structure
- Fix: The option of using the First Image Height on the Hero Carousel for Mobile wasn't working.
- Fix: Image-Text media column width when section was full-width was not working because it was using the class container instead of large--container.
- Fix: Removed the "stroke" on default elements that come with svgs such as shopify-payment-terms.
- Fix: Product Card title and price were supposed to be inline according to the styles, but the classes (flex flex-wrap, etc) were in the wrong elements since when we changed the &lt;a&gt; of the product card to wrap the title only.
- New: Added ability to select text_style for the author/date on the Article Hero.
- Update: Removed the "limit: 1" to the Richtext block on the Blog Hero and Collections Listing Hero sections (none of the other Hero sections had it).
- New: Added the ability to indicte size of the product title on the PDPs.
- Fix: In the Collection Filters snippet, there was a variable that said color_scheme when it had to be content_color_scheme
- Fix: img_simple_overlay variable with incorrect camelCase format: image_link --> changed to imageLink. 
- New: added responsive styles for tables (on static pages the tables looked too bad without any style, and they were not resposive on Mobile).
- Update: Scrolling-text improvements: ability to add Icons. Play and Pause made with css instead of js.
- New: Separator section now has the ability to set upt a different width for Desktop vs. Mobile.
- New: Added ability to replace the image of a collection card on the Featured Collection section.
- New: Added ability to add an arrow/chevron next to the title of the collection cards.
- New: Added ability to indicate a different Text Align (for heading, dots, etc) for the multi items sections (and custom section structure) on Desktop vs. Mobile.
- New: Added ability to indicate a different Text Width for the text of the head of the multi items sections (and custom section structure) on Desktop vs. Mobile.
- New: Custom util in Header now has the ability to select an Icon from a list.
- Update: More settings enabled for the img_simple_overlay snippet (present in the Mega Menu, Footer and Mobile Menu).
- New: Ability to add a secondary menu under the main menu on the Mobile Menu section.
- New: Ability to add a custom Icon to the Mobile Menu links.
- New: Ability to show the parent link as Title in the Mega Menu links columns.

- New: product_card_img_mode added the option of "Expand on hover" (and not change the image) -- previously was only "Static" or "Change on hover".
- New: Added a script that detects the browser and adds a class to the body. This is helpful because in safari, the iframes for the videos when placed in the background of a banner or hero-carousel were incorrectly positioned vs. Chrome, and there was no way to unify this.
- Update: The Theme's Cookies consent can be disabled through the Theme Settings (enable_cookies_consent). In case other app is installed or Shopify's native popup is used.
- New: Hero Carousel dots can be placed inside or outside the banner, in Desktop and Mobile separately.
- New: Sections that use the image_text structure: Added the ability to set up a Minimum image height on Desktop and a Maximum image height on Mobile. So you don't need to upload an image with a particular proportion anymore, it adapts better. Ideal for Desktop when the image is set up to cover the text height, or for Mobile if the image is too tall.
- New: Sections that use the multi_item_structure or the custom_structure: the Button/CTA of the head can be placed on the right side independently of whether the arrows are at the top or not (it used to go on the right only if the arrows were NOT at the top), or at the very bottom of the section.
- New: Sections that use the multi_item_structure now have the ability to set up the Text align (title, text, button, dots) independently for Desktop vs. Mobile.
- Update: Sections that use the multi_item_structure now have the Layout (Grid/Carousel) setting above the Items per view. It used to get lost within the Section general Settings that are at the bottom of the list.
- New: Separator Block on the Richtext Blocks now has the ability to add a border or padding independently on Desktop vs. Mobile.
- New: Richtext and Image+Text sections have a new Block called Info Cards, with similar settings as the info cards section.
- New: Announcement Bar now has the ability to add the Arrows (when more than one blocks are enabled and it's a carousel).
- Update: Scrolling-Text / Marquee, now the play/pause feature is done with only css instead of js/css.
- Update: Featured Products section: now the section isn't displayed if there are no products to show. Useful when connected to Metafields, like in the Blog Posts.
- New: Sections that use the image_text structure: image border radius is independant on Desktop vs. Mobile.
- New: Sections that use the image_text structure: full_width independant on Desktop vs. Mobile.
- Update: Now all the sections have the ability to manage the Outer Padding TOP and BOTTOM independently on Desktop vs. Mobile.
- Update: Replaced the default Fucsia color on the color schemes with BLACK, so if someone forgets to update a color, at least it's black and it doesn't bother so much.
- New: Ability to add a code of SVG for the logo in the header. And the Header Style section (when needed) can modify the color of the SVG in the initial header state.
- Update: Color Schemes default values update.
- New: Ability to make the Mega Menu Space Block stretch to fill the available space (flex-grow: 1), for more layout flexibility.
- New: Sections with Richtext Blocks now aren't displayed if there is no content to show. Useful when connected to Metafields, like in the PDPs.
- New: Ability to change the font style of the "Info Cards" card titles.
- Update: Custom badges in PDP can be floating on the right, or flow as a regular block (used to be only floating).
- Fix: list_collections_main had a variable color_scheme that had to be content_color_scheme
- New: PDP has the ability to add Accordion Blocks.
- Update: multi-item sections: when the carousel is in mode full or container, if there are less items than the items-per-view, the items are centered when the text-alignment of the section is center (used to happen only on carousel-full mode).
- New: block of Article Tags in the Article Hero section.


# v1.2.38
- Fix: Ignore products with metafield seo.hidden=1 in the section of the Recommendation API results.
- Fix: Match title height wasn't working for product cards. Neither for article and collection cards in grid layout. Also added separate setting to activate for Carousels or Grids independently.
- Fix: Lazyloading of video posters was not fully implemented.
- Fix: The class ignore-slide-tabindex shouldn't be applying to normal infor cards content, it is meant for custom code that comes with tabindex="-1" and shouldn't turn to 0 when the slide becomes visible, e.g., info cards with expand on hover, which include custom tabindex management.
- Update: Added warning message (for the customizer) to the Header Style section, as a reminder that it shouldn't be the first section in a page.


# v1.2.37
- Fix: Removed usage of unexisting setting in media_feed.liquid
- Update: Added setting 'Line dots as navigation bar' which styles line dots as a full width bar. This is to replace the nav-bar element of the carousels which is bugged.
- Update: Modified code of Accordion component so it allows nesting accordions.
- New: Added initial support for Theme Blocks.


# v1.1.36
stores: https://stella-chewys-dtc.myshopify.com

- Update: Adjust code of promotions add-on, remove from UNO-Pro branch.
- Update: GWP doc url.


# v1.1.35
stores: https://le-prunier.myshopify.com, https://spqzjv-rs.myshopify.com (current backyard)

- Update: Globally updated theme variables to match camelCase format.
- Update: Added theme check automation workflow.
- Update: Fixed theme check issues and adjusted configuration.
- Update: Removed obsolete checkout.liquid.
- Update: Improved 'Cart Discount Code' functionality, so it also applies/removes the discount code on the current cart to be able to see the discount applied to the cart & items, without the need to reach the checkout page.
- Update: Wrote code related to dynamic tags (IF X a ELSE div ENDIF) in a different way to workaround theme check bugs and re-enable checks for 17 .liquid files.


# v1.0.34
- Fix: Load more functionality in Search Main section was not working correctly because when loading pages backward the items order was wrongly calculated and only counting on products.
- Fix: Page hero mobile image was broken since v1.0.20, because it kept the data-srcset attribute even when not using lazy load. The image wasn't appearing.
- Fix: Currency and Language dropdowns, workaround to stop getting the PowerMapper issue "This form automatically submits when focus changes making it difficult to navigate via the keyboard."
- Fix: Background section file wasn't pushed to the repository.
- Fix: Variant image swatches were being set as style background image and not using lazy load. This has been replaced with an img and loading=lazy.
- Fix: Multiple changes and fix to solve or ignore theme check issues.
- Update: Added variant featured image to swatches of basic product cards.
- New: Added .githooks/commit-msg to force Simplistic developers to add the ticket ID to the commit messages. This must be set up after cloning a repo by running the script `setup_after_cloning_repo`.


# v1.0.33
stores: https://lifevac-usa.myshopify.com

- Fix: Mobile submenus opening animation were sliding also vertically. Added transition-property to force only to slide horizontally.
- Fix: Desktop submenus now are not generated when they will be replaced by a megamenu.
- Fix: Adjusted css for .shopify-app-block because it was adding empty spaces per block no matter if it doesn't have content. Some of these spaces are often visible after the footer of many stores.
- Fix: Added flex-wrap: wrap to tags filters of Blog hero section, because they were overflowing when there are too many.
- Fix: Removed #fff hardcoded color from search-results panel that affects the search_main section, because for certain color configuration, the text color could be the same as the background.
- New: Section 'Background Previous Section' which is a special section that uses javascript to move itself into the beginning of the previous section and allows to add an image or video as background of other sections that don't have such feature.
- New: Tags filters of Blog hero section can be customized instead of showing all tags used in the blog.


# v1.0.32
stores: https://pressed-floral.myshopify.com, https://growhappy-7557.myshopify.com, https://zamologlam.myshopify.com

- Fix: issue with the width of the Header-left layout on Multi Items sections, and carousel overflow.
- Fix: Made absolute url of Shipping Calculator now relative. It was pointing to the simplistic-test2 site.
- Update: Image+Text and Banner sections now have the ability to be Full-Width in Desktop but not on Mobile, and vice versa.
- Update: Image+Text sections now have a Decorative-Image block.
- Fix: Header layout "Logo-left Menu-center", the menu wasn't centered on the screen properly. Now it is.


# v1.0.31
stores: https://jvnhair.myshopify.com

- Fix: Major Bug. Our theme was using names like 'items[-1][...]', when there was just one item to add to cart. This doesn't work for Customer events 'product_added_to_cart' event, because that part of shopify don't recognize that item correctly. We changed it to use 0 instead of -1 and that solves the problem.


# v1.0.30
stores: https://sam-and-colby-store.myshopify.com

- Fix: In footer section setting "Titles style", the value for Body option was wrong so it was showing the Heading font.
- Fix: CartCache variable scope that was not locally defined and could cause random bugs when other apps use the same variable name 'o'.


# v1.0.29
stores: https://2cb82e-9e.myshopify.com, https://alvacookware.myshopify.com

- Fix: Issue in megamenu image showing shadow when passing 'false' in parameter.
- Fix: Issue with contact forms using ajax and the new hcaptcha tool that shopify has. Now we can use default submit behavior when this captcha is enabled.
- Fix: Bundle builder addon now includes the parameter quickAdd:true for the render of product_card_atc.
- Fix: Bundle builder addon now has margin below product cards.
- Fix: Bundle builder addon has a more accurate selector to find the json data, because it was breaking when the product card contains another selector.
- Fix: Bundle builder addon, navbar gap (4em) remains even when there is no navbar, i.e. using one product step only.
- Fix: Product Main section Sale/Soldout badges were showing even when the checkbox setting value was False.
- Fix: Account popup now can work with ajax disabled when the new shopify captcha is enabled. Post through ajax is now disabled by default.
- Fix: Account popup duplicated element ids and missing css rules.
- Fix: Page hero sections (PLP, Blogs and Pages) were not showing the image side at 50% width correctly when the Full width setting was ON.
- Fix: Search main section was using _grid_layout cart attribute value instead of correct value on mobile when the results include articles or pages. This could show a grid of 4 columns on mobile.
- Fix: Horizontal dropdowns were behind product card media video. Fixed by increasing z-index from 2 to 3.
- Update: Info Cards section now has a new setting "Place the title at the top".
- Update: Mobile Menu has new options.
    - Image banner and button width options: one-third (33%)
    - Border between items is not a checkbox anymore, instead a new dropdown with an option 'Main links' that shows borders between main links but not between submenu links.
- Update: Added option to make buttons full width when possible.
- Update: Added setting in collection_main and search_main to show product count label next to grid size buttons.
- Update: Added setting 'Badges style' to header section, with an option to show the cart count on the right of the icon instead of floating.
- Update: Now can login with Account Popup and reload on current page without using AJAX post.
- New: Search autocomplete now includes Pages and Articles.


# v1.0.28
- Fix: Bad merge caused UNO-Pro branch with bugs in sidecart's code. Mainly, the cart_featured_products carousel was not included, and a harmless snippet from the cart_recommendations addon was left in there.


# v1.0.27
stores: https://charmco-store.myshopify.com

- Fix: modifying the data-manual-select parameter or the "Options that require manual selection" setting was breaking some 'onVariantChange' functionalities when the product has other options that are not selected yet.
    - Product cards were not adding the 'variant' parameter to the URL.
    - Product main and product cards were not showing the featured image.
- Fix: Workaround for restoreFocusTrap issue. On Safari 16 (maybe others too), when closing a modal and a part of the footer was in the viewport the focus was being restored on the &lt;MAIN&gt; element. For some reason the buttons are not saved as the document.activeElement on Safari.


# v1.0.26
stores: https://comrad-socks.myshopify.com, https://everglow-1.myshopify.com

- Fix: .link line-height setting doesn't exist. Removed the css.
- Fix: the setting "captions_spacing_mobile" was missing from the Image block of the richtext-content sections, the variable was used in the CSS but the setting didn't exist.
- Update: scrolling_text section --> added setting to pause on hover
- Fix: the carousel arrows weren't being displayed in the Color-Schemes page since an update made in v1.0.15 (the arrows have the class 'hide' by default and then it's removed with js). Added the ability to display the arrows by default passing a variable in the snippet.
- Fix: the option to move the text outside the image didn't work for the img_simple_overlay in the Mobile Menu. Now all the img_simple_overlay (present in Footer, Mega Menu and Mobile Menu) have this option and works.


# v1.0.25
stores: https://pilotistoreus.myshopify.com, https://wondercow-nutrition.myshopify.com

- Fix: Product Gallery was showing a shadow on the Next arrow, but not on the Prev button. Now both inherit the arrow shadow global setting.
- Fix: On add to cart, must not submit values from inputs that have a name attribute equal to empty.
- Fix: newsletter form was not posting to klaviyo correctly. The email input name parameter was sending 'contant[email]' instead of 'email'.
- Update: For consistency Hero Banner arrows now inherit the arrow shadow global setting instead of always showing a shadow.
- Update: Added setting to disable the Side Cart.


# v1.0.24
Stores: https://rango-si.myshopify.com

- Fix: Product grid with "list" layout, link's :before area was broken since v1.0.20.


# v1.0.23
Stores: https://bedjet.myshopify.com, https://blakes-nut-free.myshopify.com, https://tubby-todd-bath-co.myshopify.com

- Fix: Since v1.0.20, broken tabs or select options in featured multi item sections, were showing only the last collection.


# v1.0.22
Stores: https://c74d67-4d.myshopify.com, https://435aa2-2.myshopify.com, https://thehurtskurt.myshopify.com, https://simplistic-knowledge-base.myshopify.com, https://simplistic-cs-knowledge-base.com, https://simplistic-mainsite-knowledge-base.com

- Fix: Bundle Builder fix of css z-index for step-heading element that appears below swatches due to our product cards update for ADA.
- Fix: Bundle Builder design issues with elements that overflow the container.
- Fix: Missing label in Theme Settings -&gt; Cart section for the featured products color scheme setting.
- Fix: PLP Issue, on data-grid-layout=3 the floating buttons (quick view & quick shop) where below the product card link, so you couldn't click them. Broken since due our product cards update for ADA.
- Fix: now $s.globalEval can receive script an script tag element as parameter.
- Fix: Show arrows on mobile when needed, update from v1.0.12 wasn't working (multi items sections only).
- Fix: Filtering by price in the PLP now restores focus on the right input after changing the value and tabbing out.
- Fix: Solved focus issue on filters popup (mobile/desktop).
- Update: Now '_bundle_positions' line item property is calculated automatically, you don't need to add the input in the form. 
  - **Recommendation:** add a '_locked' line item property with value 'quantity', so the user can't update the quantity of the bundle, that way we avoid issues when updating a bundle item that doesn't have enough inventory. Our Bundle Builder add-on does it.
- Update: Added option size 'Full minus 1' to the Featured Item block of collection_main and blog_main sections.
- Update: added a setting to adjust the size of the top-utils icons in the hader for MOBILE independently from Desktop. 


# v1.0.21
Stores: https://felixcatinsurance.myshopify.com

- Fix: globalEval function now executes inline javascript modules in module scope instead of global.
- Update: hover images are now hidden until the class not-mobile gets added to the body. This improves performance by avoiding to load the images when they won't show.


# v1.0.20
Stores: https://anything-possible-b2b.myshopify.com

- Fix: skip to content buttons did not have a background color on focus.
- Fix: Solved multiple Powermapper and Lighthouse issues. 
    - Changed default colors to avoid contrast issues.
    - Changed one more div.footer-title to h2 tag.
    - Added visually-hidden text "View 3D model" to button in PDP.
    - Tag links in blog landing now have role="navigation" instead of "tablist".
- Fix: Added pagination links for Load More/Infinite Scroll so Search engines can crawl the next PLP/Search/Blog pages.
- Fix: Multiple minor issues detected by theme check:
    - Wrongly closed tags
    - Unused Object
    - Use of unset variables
    - Missing translations
    - Missing arrows in megamenu "button" links when styled as links
    - Missing img attributes width and height
- Fix: issue #5. $s.getDomPath function was not returning the ID selector, as result some functionalities that should restore element focus after an ajax update weren't working, e.g. the filters checkboxes.
- Fix: issue #6. Scrolling on click of link with hash or button with data-scroll-to now sets the focus to the target element.
- Fix: issue #4. Clicking an aria-expanded="false" link now doesn't trigger the redirect and only expands its submenu.
- Fix: ADA. Quick shop and Quick view buttons now have accessible name (with aria-label) because the tooltip was only accessible on hover.
- Fix: issue #1. Updated megamenu image+overlay links and product card links, now they can be activated via speech control.
- Fix: Added background and padding to addToCartFail popup message.
- Fix: Replaced all cart/update.js api calls to change.js api, because when the cart is broken because more items where added and aren't in stock, the update.js api can't update the cart, so the user is unable to remove products and bundles and gwp addons get stuck in infinite loops.
  - Removed $s.cartUpdateDataFix and added $s.updateCartItemsQuantity, which update items 1 by 1 using the change.js api.
- Update: added skip to collection button to the Filters, on Desktop when the filters are at the top or on the side.
- Update: added a visually-hidden 'Sold Out' to the swatch label when it turns unavailable, useful for screen readers.
- Update: Product Card. Moved the badges out from the link of the image (that has tabindex=-1 and aria-hidden=false), so the readers can read them. Useful when a product is sold out, or other information.
- Update: Product Card ATC. Removed the pipe | from the add to cart button that was separating the "Add" from the price. Replaced it with a border in css. The pipe was being read by the screen reader.
- Update: Product Card. Removed link from image, now there is only one link with a :before to cover the whole product card. Used javascript to mimic the :hover of the image.
- Update: Article Card. Link now only wraps the title and a :before covers the whole card. Similar to the Product Card update, but didn't had to use javascript.
- Update: added role='radiogroup' and aria-labelledby='' (matching the id of the .option-name element) to the product-swatch element so that the screen readers recognize the group of radio buttons.
- Update: made the + and - button of the product quantity box aria-hidden="true" and tabindex="-1", because the number input alone is better to edit the quantity step-by-step or by writing a new number.
- Update: added an aria label to the Email Address field of the Newsletter form, to give the users more context of what the field is. Now there is a visual label (usually shorter, such as "Email address"), and an aria label (such as "Enter your email addres to join our mailing list").
- Update: lazy_src code optimization, and some sizes were removed.
- Update: made the first image of the first section (Hero Carousel / Banner / Image+Text / Page Hero, and the ones with those structures) load with the default srcset feature of the browser instead of using lazysizes, for performance optimization.
- Update: Swatches. When use_variant_images_as_swatches is enabled, the images were 50px width, but the resolution was too low. Changed it to 80px.
- Update: Breadcrumb as Block. The section is still available just in case.
- Update: Removed SVG Image setting from Decorative Images section, because svgs are now allowed by the image_picker setting.
- Update: $s.addToCartFail function now handles json error response and only displays the 'description' property.
- Update: Minor changes to improve keyboard navigation.
- Update: Search autocomplete now starts with a minimum of 3 characters instead of 5. This allows to search for shorter terms like 'men' and 'sale'.
- Update: Added max="..." to product quantity field and disabled plus buttons to prevent adding more products than available inventory.
- New: Added 'Description Item' block type to product_main section. The block can be used to pull info from metafields or metaobjects and print the info in accordions or tabs. The info is added inside the Enhanced Description block.


# v1.0.19
Stores: https://womens-lib-1363.myshopify.com

- Fix: Added line breaks to fulfillment info in order template.
- Fix: Solved invalid DOM issues in order template.
- Fix: Removed baseURL variable because it was never used and it was causing random errors updating URL when filtering.
- Fix: PLPs/Search/Blogs Featured Items were not hiding when they are alone in a row after the products results. This is broken since the first release, due to class name change from featured-item to collage-item.
- Fix: When using Load More/Infinite Scroll, and having a featured item after the first page, the items were being added in the DOM before the items of page="1", then the DOM order and visual representation don't match. Issue can be noted with keyboard and screen-reader navigation. Solved by adding the missing data-page attribute to div.collage-item in collection_main and blog_main sections.
- Fix: Tab buttons 'Alignment' setting not working when using 'Line' style.
- Update: PageManager component now saves the scroll position in the history state instead of the pscroll parameter in the url. This results in a cleaner url.
- Update: Replaced pagination's 'page' hardcoded param with the value in paginate.param_name. This allows to use multiple page-manager objects in the same page.
- Update: Moved accordions css & js out from collection_filters.liquid into search and collection sections to avoid transition issues and flickering of the filters panel after an ajax update.
- Update: When LinkPrefetch feature is enabled, it now only loads when the $s.connectionDataSavingRating() result is 0. So it doesn't prefetch content on slow connections, for instance on slow 3g mobile connection when there was a drag on a link instead of clicking it. Also on Desktop wifi internet connections that are actually shared by a mobile device.
- New: Added new block type 'Custom Items Data' to Accordion section. This way we can use liquid code setting to pull info from a metafield or other source and then the section parses the data to print the accordion. Tip: can be used with the device-content component to pull content from another section, like embedding an info cards section into the accordion.
- New: Added support for section groups feature. They appear in the customizer as 'Top sections group' and 'Bottom sections group', useful for adding sections that will appear in all pages, without hardcoding them in theme.liquid. Tip: use it for a custom text/banner that must appear below the header. 
- New: Richtext now supports multiple different layouts. Section comes with a new preset example of multi-columns. Replaced 'Column split' block with '-- Flexbox Definition --'. Allows different quantity of columns on each grid row. Updated contact_main section as well. Added ability to set up alignment, border, border-radius and padding to the flexbox.


# v1.0.18
Stores: https://mimichengs.myshopify.com

- Fix: solved issue in DOM structure where a closing div was at the wrong place.
- Fix: Changed how filter parameters are added to the URL, each value uses its own parameter instead of separating them by comma. Fixes Homecourt.co weird issue and works like Dawn and other themes.
- Update: Changed some default settings of the page_main section so the content is 100% width, and updated some styles on image_text.css so the styles of the iframes are specific to the content on the media-column.


# v1.0.17
Stores: https://soteri-skin.myshopify.com

- Fix: Cookies helper: remove function wasn't working.
- Fix: ADA fix of product card link label (Mayor bug).
- Fix: Allow wrap on product card price.
- Fix: Cart Cache workaround to browser back button.
- Fix: Cart Cache solved issue when a 'GET' gets triggered at the same time that a 'CHANGE' on the cart is running.
- Fix: Tweak the styling applied to child items of bundles.
- Fix: Added visibility to #side-cart transition-property because there was a weird visual issue since the update in v1.0.16.
- Fix: Translation missing error in Blog's sidebar search input.
- Update: Product card price/title css updates to avoid bugs when there is little space.
- Update: Changed fetch calls receiving 'URL' objects to now receive a url string for better compatibility with apps like Route, because they break the fetch native function without implementing the interface correctly.
- Update: Depending on the result of $s.connectionDataSavingRating(), all pages that use the &lt;page-manager&gt; component can preload data of next/prev pages to improve navigation speed. This affects PLPs, Search and Blogs. Infinite scroll feels much better now.
- New: helper function $s.connectionDataSavingRating that evaluates navigator.connection properties to indicate if you are free to load content ahead of time to improve speed, or know that you should reduce media quality if possible. Basically this function returns 0 (no data saving) when the user has a fast wifi or ethernet.
- New: helper function $s.preloadPage which acts as dictionary (volatile) of ajax responses where the url is the key. Usage example: preload next/prev PLP pages for inmediate page load on user click/scroll. Pass a 2nd argument to indicate if the response should be returned as JSON instead of HTML.
- New: Feature to add one or two buttons in the cart summary (cart page / sidecart) to pull info from a separate page and display it in a popup.
    - Shipping Calculator included by default, it pulls the html of the shipping_calculator section.
- Update: css tweaks for the new buttons in the cart summary (by default shipping calculator).
- Fix: The Pagination ("pager" mode) with too many pages was causing an horizontal overflow on Mobile.


# v1.0.16
Stores: https://drd-hydrogen.myshopify.com

- Fix: Removed obsolete setting on password.liquid section that was not doing anything.
- Fix: Sticky up/down panels were bouncing some times due to decimals on positioning.
- Fix: Youtube embeds urls now use fs=1 instead of fs=0, because it wasn't allowing fullscreen video display.
- Fix: Minor issue in filter panels, where last option wasn't showing a border below the title.
- Fix: Fixed header classes depending on behavior.
- Fix: Solved minor issue of $s.getDomPath which wasn't getting the 'id' string property on some form tags.
- Update: Improved bundle validations to remove a bundle when a child item is missing.
- Update: In filters panel, now the border can be configured to appear below group titles or below items. Below items is by default, which looks more appropiate for accordions.
- Update: Recommended Products section has a new Intent 'mixed' option. For that case, we pull products from the complementary and related APIs and include the complementary products from the last product added to the cart. The section's js had to be rebuilt to support new features.
- Update: Sliders now refresh themselves on layoutChange events when the detail.target object contains the slider.
- Update: Sidecart minor updates:
    - #side-cart element now dispatches an 'open' event (but doesn't bubbles).
    - #side-cart transition properties are now specified as 'right, left, transforms', that way the width property is not transitioned when changing between screen sizes. This solves slider issues on Free Samples and Featured Products.
- New: Added &lt;device-content&gt; component to easily move/hide content depending on screen size, matching by $s.media properties. It dispatches a 'layoutChange' window event that inner components can use to refresh themselves.
- New: Cart Recommendations add-on, based on recommended_products section with additional features like moving the content around by screen size, shuffle products, and only update recommendations when the source products change, which are pulled from the cart last added items. On desktop the recommendations appear on the left of the side cart when this one opens.
- New: Links Prefetch: performance improvement for Google Chrome using the Speculation API, can be configured in the Delevoper Zone (Theme Settings).


# v1.0.15
Stores: https://effecty-1.myshopify.com

- Fix: Keen arrows were visible before slider initialization, so users could see them even if they won't appear after init when the slider has few items. Now they are hidden by default.
- Fix: Replaced ':scope &gt; div' selectors with class selectors because they don't work correctly when using ChromeVox, breaking the PDP image galleries.
- Fix: Added margin top to selected filters when using horizontal dropdown filters.
- Fix: Image + Text section width=50% was not working correctly on resolutions close to the global container width.
- Fix: $s.throttle function was not receiving parameters on callback function.
- Update: Dynamically add/remove "not-mobile" and "is-mobile" classes based on "touchstart", "touchend" and "mousemove". IMPORTANT: when styling, only use .not-mobile together with :hover in the same selector, don't use .not-mobile to layout content.
- Update: In header menus, use preventDefault() on click events when the menu is closed, this allows to "hover" the item and open the menu without navigating the parent link.
- Update: Improve quick add/quick view buttons visibility for touchscreen desktop layouts.
- Update: Improved UX of PDP sticky panels (gallery & info) so you can reach the end of the shortest side before it gets sticky when scrolling, and it works on both up & down directions.
- New: Blog: when items per row is 1, article card image on the side (Desktop and Tablet)
- New: Side Menu: ability to add an image next to the custom link.


# v1.0.14
Stores: https://etailxpress-store.myshopify.com

- Fix: product cards floating buttons tooltips were hidden by an overflow.
- Fix: product cards button ctas colors were wrong, and it had a wrong padding.
- Fix: Load more button was not placed correctly.
- Update: fields styles improvements.
- Update: Color Swatches helper small textarea fix
- Update: header settings UI updated


# v1.0.13
Stores: https://taramps-us.myshopify.com/ , https://wildwood-landing-d2c.myshopify.com

- Fix: Keen Slider Reduce Motion fix.
- Fix: added background-color: transparent to the input/select/textarea inside the .field


# v1.0.12
Stores: https://tan-towel-inc.myshopify.com/

- Fix: Minor issue with price filters when collapsing/expanding, where the circles were getting cut off.
- Fix: Solved multiple settings referenced with wrong key.
- Fix: Solved bug of color swatches in the filters when the text value is long, the circle was squeezing.
- Fix: Bug on normal product cards, when the PLP loaded with filters applied, selecting a swatch was setting an incorrect url to the PDP for that variant. E.g., "https://simplistic-test2.myshopify.com/products/test-variants-with-missing-options?_pos=1&_fid=5c7355d9c&_ss=c&variant=42165799256235?variant=42165799190699".
- Fix: Accordion section was not using its Text Size setting.
- Update: In Hero banners, replaced scroll event with IntersectionObserver to pause/play videos automatically when they leave/enter the viewport.
- Update: Added setting to indicate if carousels on Multi item sections and Banners must show arrows on hover or static. 
- Update: On Multi item sections, when using static arrows, the arrows are also displayed on mobile and tablet when there is no visual clue of the slider (e.g., no dots and no partial display of other slides).
- Update: improved filters styles.
- New: custom Color Schemes replaced with Shopify's native color schemes throughout the site. The styles of several other things changed consecuently, like buttons styles, badges, tabs, carousel arrows/dots, etc.
- New: workaround for base.css getting cached when using the customizer and only changing colors in a scheme.


# v1.0.11
Stores: https://camphill-village-store.myshopify.com/

- Fix: Subscription radio button was not checked by default when the product requires_selling_plan=true and the default purchase option is configured as 'onetime'.
- Fix: Weird issue on some product cards where price in ATC button was not showing the subscription discounted price after switching to another variant.
- Update: To support the new Recharge integration, Subscription options from different groups are now combined and discount/price values are updated when the user changes the selling plan or variant.


# v1.0.10
Stores: https://simplistic-main-site.myshopify.com/

- Fix: Removed 'or true' from IF condion that was left behind by mistake, causing the 'More Filters' group to appear when there weren't allowed tags to show.
- Fix: Bundles not validating correctly since v1.0.8 ('related_items' were not being removed by when there is no 'main' product).
- Fix: Product card badges were throwing an Accessibility error.
- Update: Sections that has youtube videos with autoplay now also loop infinitely.
- Update: color_schemes now detect mobile font sizes specified in base.css. You don't have to replicate changes from base.css into color_schemes.liquid anymore.
- Update: Slightly improve lighthouse performance by using opacity 0.01 instead of 0 on lazyloaded images.
- Update: More info added to color_schemes template.
- New: All sections that support grid layouts now have a new setting to enable a View All/Less button when using grid mode, enabled for desktop and/or mobile.


# v1.0.9
Stores: https://snack-cocomo.myshopify.com/ , https://looloo-world.myshopify.com/

- Fix: @media queries now use EM instead of REM, because REM didn't work on Ipads. EM works exactly the same way as REM in this case, but is less buggy.
- Fix: Personalization Add-on post parameter names on submit, broken since I modified the sortFormDataBundles function in v1.0.6


# v1.0.8
Stores: https://db9544.myshopify.com/

- Fix: PLP "sort by" dropdown was not interactive on all the area inside the borders.
- Fix: PLP filters popup was not getting focus correctly when opened by clicking the filters button.
- Fix: Collections with metafield seo.hidden=1 are now excluded from the Collections Listing template.
- Fix: Changed cart items back to border top and padding bottom, fixed previous bugs and those introduced in version 1.0.7. Works correctly with the hidden products in cart page and side cart like free samples (all those with a new class 'hidden').
- Fix: Solved a number of javascript issues in password page. Do not try to initiate sections like Cookies Consent, Menus, Side cart, etc.
- Update: Added setting to invert order of multiple items added by a single 'Add to cart' action, to match the stores behavior.
- Update: 'Cookies' class replaced with a smaller implementation which only has set/get/remove functions.
- Update: Dots in carousel now have the same 'scale' on hover, active and inactive states.
- New: Added new 'Promo Review Helper' section to help configure promotions. It also helps to get the variant ids by selecting products within the customizer and then picking specific variants with checkboxes. This section replaces the old 'promo_review' snippet which no longer works due to shopify customizer loading from a generic domain that doesn't matches the theme url.
- New: Added 'Skip to Footer' link. Now that and the 'Skip to Main Content' buttons set focus on their corresponting element, so when using the Tab key, the correct element will get focused instead of starting from the header. Before this, the 'Skip to Main Content' was only scrolling down.
- New: Added 'Developer Zone' group at the end of Theme Settings. It is reserved for very technical level of configurations, where we will enable/disable workarounds and optimizations.
- New: Added 'CartCache' feature to store 'fetch' call of 'cart.js' in memory.
- New: Added $s.cartUpdateDataFix function for /cart/update.js api calls. The function retrieves cart.js info and replaces data of update by key with update by line index structure. This is to solve issues when line_item gets splitted by a discount, which makes its key to be duplicated and later causing big issues on updates to the cart.
- New: PLP and Search page filters are now wrapped in accordions. This change comes together with better handling of element focus and scroll position after ajax calls when filtering.
- New: Added Horizontal filters layout for PLP and Search Page.
- New: Added partial support to show page info in some sliders. Must be enabled through code, passing the argument showPageInfo: true to the snippet 'section_multi_item_structure'.
- New: Added setting in Developer Zone to disable/enable the _grid_layout cart attribute.
- New: Added page indicators to carousels when their dots shape is **line**.


# v1.0.7
Stores: https://fluffco-llc.myshopify.com/ , https://32448e.myshopify.com/

- Fix: some ADA improvements based on powermapper's report: 
    - Divs are not allowed as children of &lt;button&gt; elements. I changed them to &lt;span&gt;.
    - ids were repeated when the same product card was added multiple times in the same page.
- Fix: in carousel_arrow.liquid there were two characters " closing an HTML attribute instead of just one, it was causing issues. 
- Fix: some places where the css property "grid-gap" was used instead of "gap", updated.
- Fix: autoplay of Image + Text section was not working on iPhone.
- Fix: promo samples carousel on cart didn't have the css styles applied (same styles as the featured products collection in cart).
- Update: the attribute allowfullscreen had different variations throughout the Theme, I unified them all to the proper version.
- Update: added basic styles for the tables (th, td) in Articles body.
- Update: side-cart items border bottom instead of top, works better with the hidden products in cart like free samples.


# v1.0.6
Stores: https://ebadb6-2.myshopify.com/ , https://35c095.myshopify.com/

- Fix: autocomplete text & background colors on "input" fields now try to match the styling applied to the inputs. This is to solve that on dark background with white text schemes, specially on inputs with transparent background, the autocomplete colors were making the text and label unreadable.
- Fix: Social native share of articles had missing attribute data-url.
- Fix: legal note not appearing in newsletter form when using klaviyo form, due to wrong setting id.
- Fix: line item savings calculation due to discount was being wrongly multiplied by quantity.
- Fix: add aria-label to product card image link.
- Fix: $s.globalEval function now executes inline javascript in "window" object scope, because it was running within the globalEval function scope.
- Fix: none of the Richtext Tabs alignment settings were applying on Tablet size.
- Fix: missing block.id to liquid block in product_main section, css where not applying to that block.
- Update: refactor part of newsletter form content to have it in just one place avoiding issues when switching from shopify to klaviyo form.
- Update: Hero banner/carousel sections with setting Window Height now consider header and announcement bar and if the section is the first one on the page.
- Update: Product cards with MP4 as featured media now has the video element wrapped in a link to the PDP.
- Update: unified inline javascript in 1 "script" tag.
- Update: rebuilt sortFormDataBundles function add-to-cart-form component so it is now a simpler solution. It always expects main item to not have "items[...][...]" in the parameters name, then before submitting it transforms the name to "items[...][...]" with a new index greater than others being used. This allows to add bundles easily, no more headaches if the products have selling plan.
- Update: cross up sells add-on updated to work with the new way that bundle items are included when the form is submitted. Now the add-on submits the original formData variable with the added items instead of turning the source variable into a javascript object {items:[]} which doesn't support files upload.
- Update: value for 'properties[_bundle_id]' is automatically generated on "add to cart" click.
- Update: carousel autoplay now doesn't move when slider is not in the viewport.
- Update: $s.globalEval is now async function, but is now capable of executing javascript in same order they are included in the HTML, even script files follow the order, however note that 'defer' and 'async' attributes of script tags are ignored.
- New: placeholder images are now data+svg to reduce requests and avoid some CLS due to not exact aspect radio match between placeholder and final image.
- New: Added basic support for 'prefers-reduced-motion', videos don't autoplay and some animations disabled (transition duration = 1ms).
- New: added "pageInfo" option for Keen Slider. It allows to show "current page/total pages" information. Example: set "pageInfo: document.querySelector('.keen-page-info')" in the options object passed to initialize the slider, and add a div with class "keen-page-info" into the slider HTML.


# v1.0.5
Stores: https://exotic-nutrition-pet-supply.myshopify.com/ , https://free-rein-coffee.myshopify.com/

- Fix: duplicated alt="" attribute in footer logo.
- Fix: for mobile images/media height settings not working on Banner section, the firstBlock variable was being set with a block that doesn't have the correct settings.
- Fix: active carousel dot border now rendered with before instead of after to fix weird border that doesn't look as a circle.
- Update: added layout "container" for mobile in Info Cards and Testimonials sections.
- Update: improved Hero banner/carousel sections height management. Now they will keep a minimum height that matches the overlay content's height, that way it fits even when reducing the screen size.
- Update: Hero banner/carousel sections with setting "Section Height=Image Height" now can use the video mp4 aspect ratio.
- New: added commented code as example to "Show price on product swatches".


# v1.0.4
Stores: https://lilli-system.myshopify.com/ , https://cbdmd-5596.myshopify.com/ , https://detailswine.myshopify.com/

- Fix: moved the div.product-sticky-panel-position-placeholder inside the product buttons module, because when it was below, it was considered the :last-child so the buttons margin-bottom wheren't being set to 0 when this block was the last of the column.
- Fix: Sort By Alphabetically descending label was wrong, changed it to {{ 'page_top.sort_alphabetically_descending_label' | t }}.
- Fix: added appearance none a visually-hidden to prevent the radio buttons to show up on the tabs.
- Fix: null reference javascript error on PLP when collection_main top utils are disabled.
- Fix: now product cards on Recently Viewed and Recommended Product sections are properly drawn with the scheme settings selected in the customizer. The bug origin was that the sections rendering the product card don't share the main sections settings, therefore the parameters contentColorScheme and cardsColorScheme received by the product_card_atc snippet were always empty. Same fix applied to article cards on Related Articles section.
- Fix: language selector was posting the wrong parameter name.
- Fix: color of select/inputs to be the var(--scheme-fields-label-color) instead of 'color: inherit' because it was making normal dropdowns text light grey and almost imposible to read.
- Fix: password section settings fix.
- Fix: .slide-in-modal .head flex-shrink: 0.
- Fix: arrow-down class changed to chevron-down on mobile menu for active state.
- Fix: search bar bug on iPhones (due to #search-bar z-index -1).
- Fix: announcement bar layout before slider init was causing issues on drop header-scroll because the slides where shrinking and taking more vertical space temporarily, so the header-scroll was using wrong offset values.
- Fix: account popup return to url settings were breaking the registration flow when there is an error with the submitted data.
- Fix: workaround to chrome issue on product cards image that moves up 0.5em when the quick shop panel closes, this was because the focus is restored to the quick shop button that is moving away of the image-container area, which has an overflow:hidden.
- Fix: Recommended Products section was triggering components creation twice, which could lead to unexpected issues.
- Fix: Wrong class text-align-center should be text-center.
- Fix: Fixed wrong variable in a part of the related articles js, this instead of self, returned error.
- New: section_multi_item structure: ability to move Button to the bottom of the section, and choose the buttom style (btn / btn.v2 / link).
- New: added Highligths 2 and Highlights Contrast 2 to the Color Schemes.
- New: added the Hand icon to the list of available icons.
- New: ability for the footer borders to be full or container width.
- New: separator section now allows border on desktop vs mobile.
- New: added 5 text size values (designers request).
- New: on the titles, when a text is wrapped in [hi] [/hi] it will be highlighted in the Highlight color 1, same with [hi2] [/hi2].
- New: PDP margin between the blocks is now customizable.
- New: Header links weight is now customizable.
- New: Enhanced description stand alone section. Hidden by default. It allows to make the info Tabs and/or Accordions in Desktop or Mobile independantly. Allows custom Tabs/Accordions. Allows FAQ in one of the tabs.
- New: Mobile Menu now allows custom Buttons and Banners inside specific links, or on the first level (50% or 100% width).
- Update: custom items content - external links open on new tab.
- Update: util-tabs event 'tabChanged' now bubles up in the DOM.
- Update: cart, user and search icons to the ones that the devs use.
- Update: media feed initial opacity.
- Update: replaced all urls with routes variables to prepare for multi-language support.
- Update: moved all translations out of javascript assets because those were not being translated by shopify with the current customer localization.
- Update: Image filtering in Alt text (aka Thumbs grouping), now supports white spaces between values and options. They still are case sensitive.
- Update: no longer require option selection when there is only one value.
- Update: added account popup setting to disable form submission through ajax, it allows to handle errors using the standard login / register pages but still use the popup for successful login/registration flows.
- Update: color swatches inside product cards are duplicated, so the customer can choose color with the quick shop panel closed, and then can switch the color from the quick shop panel too.
- Update: PLP and search pages now don't use the '_grid_layout' cart attribute when the top utils are disabled. This is because when the developers disabled top utils they were still seeing the previous grid layout instead of the value set in the customizer, and it was very confusing.
- Update: Header sub-menu padding is now managed with a variable, much cleaner and easy.
- Update: Color swatches with background-size: cover and background-position: center;
- Update: A couple updates on the section_image_text_structure and section_multi_item_structure.
- Update: The global sections padding now is 8rem instead of 7, asked by the designers. And the sections padding range step is 10 instead of 25 (%).


# v1.0.3
Stores: https://allswell-1.myshopify.com/

- Fix: Hero banner container height when captions is on tint-box mode.
- Fix: Letter spacing of buttons wasn't working properly. I also unified and revised all the letter_spacing range fields of the site.
- Fix: Mega menu first title was duplicated.
- Fix: Product Main enhanced description tabs (forced to one-line) fix. The width must be on the info column instead of the gallery column.
- Fix: Collection filters margin on scroll.
- Fix: Footer links margin variable was missing on mobile.
- New: added settings to change styles of the Slide-In-Modals titles.
- New: added font size preview to the Color Schemes page.
- Update: updated the fonts size and scale to make it easier to copy designs.
- Update: added link arrow option to the article cards.
- Update: keen arrows and dots styles.

# v1.0.2
Stores: https://seedsheets.myshopify.com/

- New: setting in Timeline section to place images in the opposite side on 'Alternate' mode (Desktop).
- New: setting in Recommended Products section to support complementary products defined in the Search & Discovery app.
- Fix: quick view now doesn't break if there isn't an enhanced description panel opened by default.
- Fix: product_card_img snippet was adding the second-img even when the product has only one image.
- Fix: added settings to choose the background and label colors of the Fields on the Collage items (also Featured items on PLP and Blog). Since recently the fields colors can be selected for each color scheme separately, but the fields on sections like Banner and the Collage items must have their own color settings because the colors are custom (due to the background image). I had done it on the Banner section but I didn't do it on the Collage items, now it's done there as well.
- Fix: Added Error and Success colors on Newsletter forms on Banner and Collage items.
- Update: can avoid smooth scroll by setting the 'no-smooth-scroll' class to a parent element.
- Update: added $s.devlogStyle variable to help normalize styling of hightlighted important messages on the console log.
- Update: Global updates and fixes
    - Small label styles separately from Subheading.
    - Links style settings.
    - Newsletter submit icon selection (setting).
    - Arrows and chevrons icons renamed.
    - Product card hover image fix.
    - Image text some padding mobile update/fix.
    - Hero banner padding mobile update/fix.
- Update: Global updates and fixes
    - Footer links and titles styles (settings)
    - Mega menu title and text sizes (settings)
    - Changed "Subtitle" to "Subheading" on the text style settings globally.
- Update: replaced badges background and label color settings with highlights and highlights contrast, and now the badges have their own color options separately like the Tabs.
- Update: added option to change button color on hover (uses the Highlight color).
- Update: Contact Main now has the ability to add content blocks, including the column split like the Richtext section (to achieve a design like Alva's contact page).
- Update: 
    - Added support for file upload on Add To Cart component (only for FormData body format)
    - Fixed file name length in cart item


# v1.0.1
Stores: https://alvacookware.myshopify.com/ , https://burst-usa.myshopify.com/ , https://renwick-golf.myshopify.com/ , https://newstatebags.myshopify.com/

- Fix: Related articles/Recommended products/Recently viewed not working. 
- Fix: Related articles --&gt; updated data-items-limit to items_per_view_desktop instead of slides_per_view_desktop (that was old)
- Fix: Section_multi_item.css content overflow fixed. 
- Fix: Section_multi_item_structure removed the validation to check if itemsHTML != blank, it was causing issues on the section with dynamic content like Related articles/Recommended products/Recently viewed.
- Fix: CTA_style2 missing from banner.liquid
- Fix: Subcategories carousel on collection, missing center align on Tablets.
- Fix: compact banner: it had double border. Removed the one from the .compact-banner element.
- Fix: removed text-align-center from collection-wrapper (not necessary and it affected some search results in a bad way).
- Fix: some adjustments on the password page.
- New: Breadcrumb now has different styles for desktop/mobile
- New: Compact banner: added adjustable blocks-spacing. Added separator block.
- New: mega menu: added spacing/border block. Added featured_product_inline mode.
- New: timeline: image-fit selection (cover/contain). Items images border radius. Items images with on mobile.
- New: added border radius to all the img_simple_overlay elements (mega menu, footer, mobile menu).
- New: added link to the image block of richtext blocks.
- New: added title_size to items of the the info cards and testimonials
- Update: article: moved comments above the article footer/nav
- Update: h5 and h6 font-size
- Update: quick view now shows the enhanced description first panel always collapsed.

#v1.0.0
Stores: https://fresh-wave-1.myshopify.com/ , https://cannabolish-1.myshopify.com/
