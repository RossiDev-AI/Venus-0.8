{ pkgs, ... }: {
  # Canal de pacotes mais atualizado para compatibilidade com Next.js recente
  channel = "stable-24.11"; 

  # Pacotes necessários
  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
  ];

  # Variáveis de ambiente
  env = {};

  idx = {
    # Extensões para produtividade
    extensions = [
      "bradlc.vscode-tailwindcss"
      "dsznajder.es7-react-js-snippets"
      "esbenp.prettier-vscode"
    ];

    # Configuração do Workspace
    workspace = {
      onCreate = {
        npm-install = "npm install --force";
      };
      # Garante que o servidor reinicie corretamente se você fechar o IDX
      #onStart = {
       # run-dev = "npm run dev";
      #};
    };

    # Preview do Next.js corrigido
    previews = {
      enable = true;
      previews = {
        web = {
          # Comente a linha abaixo para o IDX PARAR de iniciar sozinho
          # command = ["npm" "run" "dev" "--" "-p" "$PORT" "-H" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}