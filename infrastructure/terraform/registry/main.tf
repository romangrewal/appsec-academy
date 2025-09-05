provider "linode" {
  token = var.linode_token
}

resource "linode_instance" "nano" {
  label      = "centos-stream-9-registry"
  type       = "g6-nanode-1"
  region     = var.linode_region
  image      = "linode/centos-stream9"
  tags       = ["terraform", "centos"]
  authorized_keys = [chomp(file("~/.ssh/id_rsa.pub"))]
}

locals {
  linode_ip = tolist(linode_instance.nano.ipv4)
}

resource "linode_firewall" "firewall" {
  label = "registry-firewall"
  
  inbound_policy = "DROP"     # or "ACCEPT"
  outbound_policy = "ACCEPT"  # required too

  inbound {
    label    = "allow-ssh"
    action   = "ACCEPT"
    protocol = "TCP"
    ports    = "22"
    ipv4     = ["0.0.0.0/0"]
    ipv6     = ["::/0"]
  }
  
  inbound {
    label    = "allow-http"
    action   = "ACCEPT"
    protocol = "TCP"
    ports    = "80"
    ipv4     = ["0.0.0.0/0"]
    ipv6     = ["::/0"]
  }

  inbound {
    label    = "allow-https"
    action   = "ACCEPT"
    protocol = "TCP"
    ports    = "443"
    ipv4     = ["0.0.0.0/0"]
    ipv6     = ["::/0"]
  }

  inbound {
    label    = "allow-ping"
    action   = "ACCEPT"
    protocol = "ICMP"
    ipv4     = ["0.0.0.0/0"]
    ipv6     = ["0::/0"]
  }

  linodes = [linode_instance.nano.id]

}

resource "local_file" "ansible_inventory" {
  content  = templatefile("${path.module}/inventory.tpl", {
    ip = local.linode_ip[0]
  })
  filename = "../../appsec-ansible/inventory.ini"
}

