import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Reviews } from '../Reviews';
import { Media } from '../Media';
import { MediaCarousel } from '../MediaCarousel';
import { Accordions } from '../Accordions';

describe('Media & Social Blocks', () => {
  describe('Reviews', () => {
    const mockReviews = [
      {
        name: 'John Doe',
        quote: 'Great product! Highly recommend.',
        stars: 5,
        verified: true,
      },
      {
        name: 'Jane Smith',
        quote: 'Good quality, fast shipping.',
        stars: 4,
      },
    ];

    it('renders all reviews in stacked layout', () => {
      render(<Reviews items={mockReviews} layout="stacked" />);
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
      expect(screen.getByText(/Great product! Highly recommend\./)).toBeInTheDocument();
      expect(screen.getByText(/Good quality, fast shipping\./)).toBeInTheDocument();
    });

    it('displays star ratings correctly', () => {
      render(<Reviews items={mockReviews} />);
      const starContainers = screen.getAllByText(/★/);
      expect(starContainers.length).toBeGreaterThan(0);
    });

    it('shows verified badge when applicable', () => {
      render(<Reviews items={mockReviews} />);
      expect(screen.getByText('✓ Verified')).toBeInTheDocument();
    });

    it('renders carousel layout', () => {
      render(<Reviews items={mockReviews} layout="carousel" />);
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
    });

    it('renders heading', () => {
      render(<Reviews items={mockReviews} />);
      expect(screen.getByText('What Customers Say')).toBeInTheDocument();
    });
  });

  describe('Media', () => {
    it('renders image media', () => {
      render(
        <Media
          src="https://example.com/image.jpg"
          alt="Test Image"
          type="image"
        />
      );
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(img).toHaveAttribute('alt', 'Test Image');
    });

    it('renders video media', () => {
      render(
        <Media
          src="https://example.com/video.mp4"
          alt="Test Video"
          type="video"
        />
      );
      const video = screen.getByLabelText('Test Video');
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute('src', 'https://example.com/video.mp4');
    });

    it('renders caption when provided', () => {
      render(
        <Media
          src="https://example.com/image.jpg"
          type="image"
          caption="This is a test caption"
        />
      );
      expect(screen.getByText('This is a test caption')).toBeInTheDocument();
    });

    it('does not render caption when not provided', () => {
      const { container } = render(
        <Media src="https://example.com/image.jpg" type="image" />
      );
      const caption = container.querySelector('p');
      expect(caption).not.toBeInTheDocument();
    });
  });

  describe('MediaCarousel', () => {
    const mockMedia = [
      { type: 'image' as const, src: 'https://example.com/img1.jpg', alt: 'Image 1' },
      { type: 'image' as const, src: 'https://example.com/img2.jpg', alt: 'Image 2' },
      { type: 'video' as const, src: 'https://example.com/video.mp4', alt: 'Video 1' },
    ];

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('renders the first media item by default', () => {
      render(<MediaCarousel media={mockMedia} />);
      const images = screen.getAllByAltText('Image 1');
      expect(images.length).toBeGreaterThan(0);
    });

    it('renders navigation arrows for multiple items', () => {
      render(<MediaCarousel media={mockMedia} />);
      expect(screen.getByLabelText('Previous media')).toBeInTheDocument();
      expect(screen.getByLabelText('Next media')).toBeInTheDocument();
    });

    it('displays media counter', () => {
      render(<MediaCarousel media={mockMedia} />);
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('navigates to next media on button click', () => {
      render(<MediaCarousel media={mockMedia} />);
      const nextButton = screen.getByLabelText('Next media');
      fireEvent.click(nextButton);
      const images = screen.getAllByAltText('Image 2');
      expect(images.length).toBeGreaterThan(0);
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });

    it('navigates to previous media on button click', () => {
      render(<MediaCarousel media={mockMedia} />);
      const prevButton = screen.getByLabelText('Previous media');
      fireEvent.click(prevButton);
      expect(screen.getByLabelText('Video 1')).toBeInTheDocument();
      expect(screen.getByText('3 / 3')).toBeInTheDocument();
    });

    it('renders thumbnail navigation', () => {
      render(<MediaCarousel media={mockMedia} />);
      const thumbnails = screen.getAllByRole('button');
      // 2 arrow buttons + 3 thumbnail buttons
      expect(thumbnails.length).toBe(5);
    });

    it('switches media on thumbnail click', () => {
      render(<MediaCarousel media={mockMedia} />);
      const thumbnails = screen.getAllByRole('button');
      // Click the third thumbnail (index 4, after the 2 arrow buttons)
      fireEvent.click(thumbnails[4]);
      expect(screen.getByLabelText('Video 1')).toBeInTheDocument();
    });

    it('does not render navigation for single item', () => {
      render(<MediaCarousel media={[mockMedia[0]]} />);
      expect(screen.queryByLabelText('Previous media')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Next media')).not.toBeInTheDocument();
    });

    it('autoplays when autoplay is enabled', () => {
      render(<MediaCarousel media={mockMedia} autoplay={true} />);
      const images1 = screen.getAllByAltText('Image 1');
      expect(images1.length).toBeGreaterThan(0);

      // Fast-forward 5 seconds
      vi.advanceTimersByTime(5000);

      const images2 = screen.getAllByAltText('Image 2');
      expect(images2.length).toBeGreaterThan(0);
    });
  });

  describe('Accordions', () => {
    const mockSections = [
      {
        title: 'What is this product?',
        content: 'This is a great product that solves your problems.',
      },
      {
        title: 'How do I use it?',
        content: 'Simply follow the instructions provided.',
      },
      {
        title: 'What is the return policy?',
        content: '30-day money-back guarantee.',
      },
    ];

    it('renders all accordion sections', () => {
      render(<Accordions sections={mockSections} />);
      expect(screen.getByText('What is this product?')).toBeInTheDocument();
      expect(screen.getByText('How do I use it?')).toBeInTheDocument();
      expect(screen.getByText('What is the return policy?')).toBeInTheDocument();
    });

    it('renders heading', () => {
      render(<Accordions sections={mockSections} />);
      expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    });

    it('sections are closed by default', () => {
      render(<Accordions sections={mockSections} />);
      expect(screen.queryByText('This is a great product that solves your problems.')).not.toBeInTheDocument();
    });

    it('opens section on click', () => {
      render(<Accordions sections={mockSections} />);
      const firstSection = screen.getByText('What is this product?');
      fireEvent.click(firstSection);
      expect(screen.getByText('This is a great product that solves your problems.')).toBeInTheDocument();
    });

    it('closes section on second click', () => {
      render(<Accordions sections={mockSections} />);
      const firstSection = screen.getByText('What is this product?');

      // Open
      fireEvent.click(firstSection);
      expect(screen.getByText('This is a great product that solves your problems.')).toBeInTheDocument();

      // Close
      fireEvent.click(firstSection);
      expect(screen.queryByText('This is a great product that solves your problems.')).not.toBeInTheDocument();
    });

    it('closes previous section when opening new one', () => {
      render(<Accordions sections={mockSections} />);

      // Open first section
      const firstSection = screen.getByText('What is this product?');
      fireEvent.click(firstSection);
      expect(screen.getByText('This is a great product that solves your problems.')).toBeInTheDocument();

      // Open second section
      const secondSection = screen.getByText('How do I use it?');
      fireEvent.click(secondSection);
      expect(screen.getByText('Simply follow the instructions provided.')).toBeInTheDocument();
      expect(screen.queryByText('This is a great product that solves your problems.')).not.toBeInTheDocument();
    });

    it('has correct aria-expanded attribute', () => {
      render(<Accordions sections={mockSections} />);
      const buttons = screen.getAllByRole('button');

      // All closed initially
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-expanded', 'false');
      });

      // Open first
      fireEvent.click(buttons[0]);
      expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
