import { Banner } from '../Blocks/Banner';
import { Callout } from '../Blocks/Callout';
import { Text } from '../Blocks/Text';
import { Reviews } from '../Blocks/Reviews';
import { IconGroup } from '../Blocks/IconGroup';
import { Media } from '../Blocks/Media';
import { MediaCarousel } from '../Blocks/MediaCarousel';
import { Accordions } from '../Blocks/Accordions';
import { ProductGrid } from '../Blocks/ProductGrid';
import { VariantSelector } from '../Blocks/VariantSelector';
import { ProductImageCarousel } from '../Blocks/ProductImageCarousel';
import { AddToCartButton } from '../Blocks/AddToCartButton';
import { UpsellCarousel } from '../Blocks/UpsellCarousel';

export const BlockRegistry: Record<string, React.ComponentType<Record<string, unknown>>> = {
  Banner,
  Callout,
  Text,
  Reviews,
  IconGroup,
  Media,
  MediaCarousel,
  Accordions,
  ProductGrid,
  VariantSelector,
  ProductImageCarousel,
  AddToCartButton,
  UpsellCarousel,
};
