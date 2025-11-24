import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up State
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState<number | null>(null);
  const [captchaInput, setCaptchaInput] = useState("");

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    setCaptchaQuestion(`${a} + ${b} = ?`);
    setCaptchaAnswer(a + b);
    setCaptchaInput("");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      if (error) throw error;

      // Kullanıcının rolünü kontrol et
      if (data.user) {
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (roleError) {
          console.error("Role check error:", roleError);
        }

        // Eğer kullanıcı yasaklıysa
        if (roleData?.role === "banned") {
          await supabase.auth.signOut();
          toast({
            title: "Hesabınız yasaklandı",
            description: "Lütfen müşteri hizmetleri ile iletişime geçin.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      toast({
        title: "Giriş başarılı!",
        description: "Hoş geldiniz.",
      });
      navigate("/");
    } catch (error: any) {
      const errorMessages: Record<string, string> = {
        "Invalid login credentials": "Geçersiz giriş bilgileri",
        "Email not confirmed": "E-posta adresi doğrulanmamış",
        "Invalid email or password": "Geçersiz e-posta veya şifre",
        "User not found": "Kullanıcı bulunamadı",
        "Invalid email": "Geçersiz e-posta adresi",
      };
      toast({
        title: "Giriş başarısız",
        description: errorMessages[error.message] || "Giriş yapılırken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!captchaInput || captchaAnswer === null || parseInt(captchaInput, 10) !== captchaAnswer) {
        toast({
          title: "Güvenlik doğrulaması hatalı",
          description: "Lütfen doğrulama sorusunu doğru yanıtlayın.",
          variant: "destructive",
        });
        generateCaptcha();
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast({
        title: "Kayıt başarılı!",
        description: "Hesabınız oluşturuldu. Giriş yapabilirsiniz.",
      });
      generateCaptcha();
    } catch (error: any) {
      const errorMessages: Record<string, string> = {
        "User already registered": "Bu e-posta adresi zaten kayıtlı",
        "Password should be at least 6 characters": "Şifre en az 6 karakter olmalıdır",
        "Invalid email": "Geçersiz e-posta adresi",
        "Email rate limit exceeded": "Çok fazla deneme yaptınız, lütfen daha sonra tekrar deneyin",
        "Signup requires a valid password": "Kayıt için geçerli bir şifre gereklidir",
        "Unable to validate email address: invalid format": "E-posta adresi formatı geçersiz",
      };
      toast({
        title: "Kayıt başarısız",
        description: errorMessages[error.message] || "Kayıt olurken bir hata oluştu",
        variant: "destructive",
      });
      generateCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md shadow-hover">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold gradient-hero bg-clip-text text-transparent">
            KICKZ
          </CardTitle>
          <CardDescription>Hesabınıza giriş yapın veya yeni hesap oluşturun</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Giriş Yap</TabsTrigger>
              <TabsTrigger value="signup">Kayıt Ol</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">E-posta</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Şifre</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-hero border-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Giriş yapılıyor...
                    </>
                  ) : (
                    "Giriş Yap"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">Ad</Label>
                    <Input
                      id="first-name"
                      type="text"
                      placeholder="Adınız"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Soyad</Label>
                    <Input
                      id="last-name"
                      type="text"
                      placeholder="Soyadınız"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">E-posta</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Şifre</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="En az 6 karakter"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Güvenlik Doğrulaması</Label>
                  <p className="text-xs text-muted-foreground">
                    Lütfen şu soruyu yanıtlayın: <span className="font-semibold">{captchaQuestion}</span>
                  </p>
                  <Input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Cevabınızı yazın"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-hero border-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kayıt yapılıyor...
                    </>
                  ) : (
                    "Kayıt Ol"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
