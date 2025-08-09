import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/enhanced-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Mail, MapPin, Clock } from "lucide-react"
import { useForm } from "react-hook-form"
import { useToast } from "@/hooks/use-toast"

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  userType: string;
  subject: string;
  message: string;
}

const ContactUs = () => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ContactForm>();
  const { toast } = useToast();

  const onSubmit = async (data: ContactForm) => {
    // Here you would typically send the form data to your backend
    console.log('Contact form submission:', data);
    
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    
    reset();
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Support",
      details: ["+91 98765 43210", "+91 87654 32109"],
      description: "Mon-Sat 6:00 AM - 8:00 PM"
    },
    {
      icon: Mail,
      title: "Email Support",
      details: ["support@seadirect.in", "sales@seadirect.in"],
      description: "24/7 Email Support"
    },
    {
      icon: MapPin,
      title: "Headquarters",
      details: ["Marine Drive, Fort", "Mumbai, Maharashtra 400001"],
      description: "Visit us for partnerships"
    },
    {
      icon: Clock,
      title: "Market Hours",
      details: ["5:00 AM - 10:00 PM", "All coastal markets"],
      description: "Peak hours: 6:00 AM - 9:00 AM"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Get in Touch</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about our platform? Want to become a partner? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{info.title}</h4>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">{detail}</p>
                        ))}
                        <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-border bg-primary/5">
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-2">For Fishermen</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Join our platform and sell directly to buyers. No middlemen, better prices.
                </p>
                <div className="flex space-x-2">
                  <Button variant="ocean" size="sm">Join as Fisherman</Button>
                  <Button variant="outline" size="sm">Download App</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      {...register('email', { required: 'Email is required' })}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      {...register('phone', { required: 'Phone is required' })}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="userType">I am a...</Label>
                    <Select onValueChange={(value) => setValue('userType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fisherman">Fisherman</SelectItem>
                        <SelectItem value="supplier">Supplier/Trader</SelectItem>
                        <SelectItem value="hotel">Hotel/Restaurant</SelectItem>
                        <SelectItem value="market">Market Vendor</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="What's this about?"
                    {...register('subject', { required: 'Subject is required' })}
                  />
                  {errors.subject && (
                    <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={4}
                    {...register('message', { required: 'Message is required' })}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
                  )}
                </div>

                <Button type="submit" variant="ocean" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;